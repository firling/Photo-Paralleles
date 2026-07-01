import { redirect } from "next/navigation";

// The association page is now the site's landing page (served at "/"). This
// route is kept only to redirect any existing links/bookmarks to the new home.
export default function AssociationPage() {
  redirect("/");
}
