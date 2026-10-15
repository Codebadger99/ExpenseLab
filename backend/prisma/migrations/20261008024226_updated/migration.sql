-- CreateEnum
CREATE TYPE "IncomeSource" AS ENUM ('SALARY', 'BUSINESS', 'GIFT', 'OTHER');

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "incomeSources" "IncomeSource" NOT NULL DEFAULT 'BUSINESS';
