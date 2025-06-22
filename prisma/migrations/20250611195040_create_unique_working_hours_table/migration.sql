-- CreateTable
CREATE TABLE "UniqueWorkingHours" (
    "date" TIMESTAMP(3) NOT NULL,
    "barberId" TEXT NOT NULL,
    "start" TIMESTAMP(3),
    "end" TIMESTAMP(3),
    "middayWindows" JSONB,

    CONSTRAINT "UniqueWorkingHours_pkey" PRIMARY KEY ("date","barberId")
);

-- AddForeignKey
ALTER TABLE "UniqueWorkingHours" ADD CONSTRAINT "UniqueWorkingHours_barberId_fkey" FOREIGN KEY ("barberId") REFERENCES "Barber"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
