import { redirect } from "next/navigation";
import { getArtist, getBookByArtist } from "@/lib/queries";

export const dynamic = "force-dynamic";

// Artists are now detailed inside their book page. Redirect any legacy
// /artistes/[slug] link to the matching book (anchored on the author section),
// falling back to the shop when no book is linked.
export default async function ArtistRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const artist = await getArtist(slug);
  if (!artist) redirect("/livres");
  const book = await getBookByArtist(slug);
  redirect(book ? `/livres/${book.slug}#auteur` : "/livres");
}
