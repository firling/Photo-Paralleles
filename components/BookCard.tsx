import Link from "next/link";
import { type Book, availabilityLabel, formatPrice } from "@/lib/content";
import { getArtistOfBook } from "@/lib/queries";
import AddToCartButton from "@/components/AddToCartButton";

/** Book card used in the collection teaser and the shop grid. */
export default async function BookCard({ book }: { book: Book }) {
  const artist = await getArtistOfBook(book);
  const href = `/livres/${book.slug}`;

  return (
    <article className="book">
      <Link className="book__cover" href={href}>
        <span className="book__tag">{availabilityLabel(book.availability)}</span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={book.cover} alt={book.title} />
      </Link>
      <h3 className="book__title">
        <Link href={href}>{book.title}</Link>
      </h3>
      <p className="book__author">{artist?.name}</p>
      <div className="book__row">
        <span className="book__price">{formatPrice(book.price, book.currency)}</span>
        <AddToCartButton
          slug={book.slug}
          title={book.title}
          priceCents={Math.round(book.price * 100)}
          cover={book.cover}
          availability={book.availability}
        />
      </div>
    </article>
  );
}
