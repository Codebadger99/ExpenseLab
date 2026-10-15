/*
  Warnings:

  - The values [INCOME] on the enum `Category` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Category_new" AS ENUM ('FOOD', 'TRANSPORT', 'BILLS', 'SHOPPING', 'HEALTH', 'ENTERTAINMENT', 'SUBSCRIPTION', 'OTHER');
ALTER TABLE "public"."Transaction" ALTER COLUMN "category" DROP DEFAULT;
ALTER TABLE "Transaction" ALTER COLUMN "category" TYPE "Category_new" USING ("category"::text::"Category_new");
ALTER TABLE "Budget" ALTER COLUMN "category" TYPE "Category_new" USING ("category"::text::"Category_new");
ALTER TABLE "Notification" ALTER COLUMN "category" TYPE "Category_new" USING ("category"::text::"Category_new");
ALTER TYPE "Category" RENAME TO "Category_old";
ALTER TYPE "Category_new" RENAME TO "Category";
DROP TYPE "public"."Category_old";
ALTER TABLE "Transaction" ALTER COLUMN "category" SET DEFAULT 'FOOD';
COMMIT;

-- AlterTable
ALTER TABLE "Transaction" ALTER COLUMN "type" DROP DEFAULT;
