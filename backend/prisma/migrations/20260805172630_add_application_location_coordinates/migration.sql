-- AlterTable
ALTER TABLE "applications" ADD COLUMN     "location_code" TEXT,
ADD COLUMN     "location_latitude" DOUBLE PRECISION,
ADD COLUMN     "location_longitude" DOUBLE PRECISION;
