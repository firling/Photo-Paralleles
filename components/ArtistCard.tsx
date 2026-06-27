import Link from "next/link";
import { type Artist } from "@/lib/content";
import { getBookByArtist } from "@/lib/queries";

/**
 * Artist card. `variant="mini"` renders the compact 8-column home grid item
 * (name only); the default renders the full artists-page card.
 */
export default async function ArtistCard({
  artist,
  variant = "full",
}: {
  artist: Artist;
  variant?: "full" | "mini";
}) {
  const book = await getBookByArtist(artist.slug);

  return (
    <Link className="artist" href={`/artistes/${artist.slug}`}>
      <div className="artist__photo">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={artist.portrait} alt={artist.name} />
      </div>
      <div className="artist__name">{artist.name}</div>
      {variant === "full" && (
        <>
          <div className="artist__meta">
            {artist.originCountry} · {artist.baseCity}
          </div>
          {book && <div className="artist__book">« {book.title} »</div>}
        </>
      )}
    </Link>
  );
}
