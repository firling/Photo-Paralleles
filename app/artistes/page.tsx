import { redirect } from "next/navigation";

// The standalone artists section has been folded into the book detail pages
// (each book now presents its author). Keep the route as a permanent redirect so
// existing links and bookmarks land on the shop.
export default function ArtistsIndexRedirect() {
  redirect("/livres");
}
