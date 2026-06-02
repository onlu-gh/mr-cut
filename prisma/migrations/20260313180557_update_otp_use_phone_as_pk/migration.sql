/*
  Warnings:

  - The primary key for the `Otp` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `generatedAt` on the `Otp` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Otp` table. All the data in the column will be lost.
  - Added the required column `phone_number` to the `Otp` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Otp" DROP CONSTRAINT "Otp_userId_fkey";

-- AlterTable
ALTER TABLE "Otp" DROP CONSTRAINT "Otp_pkey",
DROP COLUMN "generatedAt",
DROP COLUMN "userId",
ADD COLUMN     "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "phone_number" TEXT NOT NULL,
ADD CONSTRAINT "Otp_pkey" PRIMARY KEY ("phone_number");
