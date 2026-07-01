-- AlterTable: limited print run + live stock for each book.
-- `copiesTotal` is the fixed number of printed copies (public "édition limitée").
-- `copiesRemaining` is the live stock, decremented on order and adjustable in the
-- back-office; at 0 the book becomes non-orderable. Existing rows default to 320.
ALTER TABLE "Book" ADD COLUMN     "copiesTotal" INTEGER NOT NULL DEFAULT 320,
ADD COLUMN     "copiesRemaining" INTEGER NOT NULL DEFAULT 320;
