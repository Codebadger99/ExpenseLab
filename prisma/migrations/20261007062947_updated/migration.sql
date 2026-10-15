-- CreateEnum
CREATE TYPE "JournalStatus" AS ENUM ('NEEDS_REVIEW', 'WORTH_IT');

-- AlterTable
ALTER TABLE "Journal" ADD COLUMN     "journalStatus" "JournalStatus" NOT NULL DEFAULT 'NEEDS_REVIEW',
ALTER COLUMN "why" DROP NOT NULL;
