/*
  Warnings:

  - The `middayWindows` column on the `UniqueWorkingHours` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "UniqueWorkingHours" DROP COLUMN "middayWindows",
ADD COLUMN     "middayWindows" TEXT[];
