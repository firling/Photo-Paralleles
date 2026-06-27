#!/usr/bin/env python3
"""Crop artist portraits out of the IG cover cards and place their artwork.
Covers are designed cards: name (top) + embedded photo (middle) + collection footer.
We auto-detect the photo rectangle via non-white row/column coverage."""
import os
from PIL import Image

RAW = "public/artists/_raw"
OUT = "public/artists"

# cover shortcode, artwork shortcode, slug
ARTISTS = [
    ("DZ-L19aim6O", "DZ-L2IFCor6", "giorgia-vlassich"),
    ("DZ-Lf0jioZB", "DZ-Lf-cCtv4", "francois-xavier-seren"),
    ("DZ-KnEfiui5", "DZ-KnMoiqK6", "ullic-morard"),
    ("DZxnNaVispZ", "DZxnNkGijNe", "jean-matthieu-gosselin"),
    ("DZxX27wii4q", "DZxX3FKCp_k", "maeva-benaiche"),
    ("DZxCAi3CkpD", "DZxCArJij3D", "rafa-badia"),
    ("DZuvMzfDBA0", "DZuvM7GjKE2", "claire-amaouche"),
    ("DZrZUjSjHQK", "DZrZUqKjP6J", "dominique-agius"),
]

# Manual portrait boxes (native 1080x1439) for covers whose photo sits on a
# near-white background, where the coverage detector fails.
MANUAL_BOX = {
    "jean-matthieu-gosselin": (60, 372, 1032, 1284),
    "dominique-agius": (40, 384, 1046, 1236),
}


def detect_photo_box(im, white=235, row_thr=0.45, col_thr=0.5):
    """Return (x0,y0,x1,y1) of the largest non-white horizontal band (the photo)."""
    g = im.convert("RGB")
    W, H = g.size
    px = g.load()

    def nonwhite(x, y):
        r, gg, b = px[x, y]
        return 1 if (r < white or gg < white or b < white) else 0

    row_cov = []
    step = 2
    for y in range(H):
        s = sum(nonwhite(x, y) for x in range(0, W, step))
        row_cov.append(s / (W / step))
    # longest run of rows above threshold
    best_l = best_r = 0
    cur_l = 0
    for y in range(H + 1):
        active = y < H and row_cov[y] > row_thr
        if active:
            if y == 0 or row_cov[y - 1] <= row_thr:
                cur_l = y
            if y - cur_l > best_r - best_l:
                best_l, best_r = cur_l, y
    y0, y1 = best_l, best_r
    # columns within band
    col_cov = []
    for x in range(W):
        s = sum(nonwhite(x, y) for y in range(y0, y1, step))
        col_cov.append(s / max(1, (y1 - y0) / step))
    x0 = 0
    while x0 < W and col_cov[x0] < col_thr:
        x0 += 1
    x1 = W - 1
    while x1 > 0 and col_cov[x1] < col_thr:
        x1 -= 1
    return x0, y0, x1, y1


def main():
    for cover_sc, art_sc, slug in ARTISTS:
        d = os.path.join(OUT, slug)
        os.makedirs(d, exist_ok=True)
        cover_p = os.path.join(RAW, f"{cover_sc}_01.webp")
        cover = Image.open(cover_p).convert("RGB")
        if slug in MANUAL_BOX:
            x0, y0, x1, y1 = MANUAL_BOX[slug]
        else:
            x0, y0, x1, y1 = detect_photo_box(cover)
        portrait = cover.crop((x0, y0, x1, y1))
        portrait.save(os.path.join(d, "portrait.jpg"), quality=92)
        cover.save(os.path.join(d, "cover.jpg"), quality=90)
        # artwork: last slide, full
        art_files = [f for f in os.listdir(RAW) if f.startswith(art_sc)]
        if art_files:
            art = Image.open(os.path.join(RAW, art_files[0])).convert("RGB")
            art.save(os.path.join(d, "oeuvre.jpg"), quality=92)
        print(f"{slug:24} portrait box=({x0},{y0},{x1},{y1}) "
              f"{x1-x0}x{y1-y0}  artwork={art_files[0] if art_files else 'NONE'}")


if __name__ == "__main__":
    main()
