/*
  Warnings:

  - The primary key for the `UniqueWorkingHours` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `barberId` on the `UniqueWorkingHours` table. All the data in the column will be lost.
  - You are about to drop the column `middayWindows` on the `UniqueWorkingHours` table. All the data in the column will be lost.
  - Added the required column `barber_id` to the `UniqueWorkingHours` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "UniqueWorkingHours" DROP CONSTRAINT "UniqueWorkingHours_barberId_fkey";

-- AlterTable
ALTER TABLE "UniqueWorkingHours" DROP CONSTRAINT "UniqueWorkingHours_pkey",
DROP COLUMN "barberId",
DROP COLUMN "middayWindows",
ADD COLUMN     "barber_id" TEXT NOT NULL,
ADD COLUMN     "midday_windows" TEXT[],
ADD CONSTRAINT "UniqueWorkingHours_pkey" PRIMARY KEY ("date", "barber_id");

-- AddForeignKey
ALTER TABLE "UniqueWorkingHours" ADD CONSTRAINT "UniqueWorkingHours_barber_id_fkey" FOREIGN KEY ("barber_id") REFERENCES "Barber"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
