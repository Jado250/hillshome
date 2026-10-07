-- CreateEnum
CREATE TYPE "ContactMethod" AS ENUM ('CALL', 'SMS', 'WHATSAPP', 'EMAIL');

-- AlterTable
ALTER TABLE "ServiceRequest" ADD COLUMN     "contactMethod" "ContactMethod" NOT NULL DEFAULT 'EMAIL';
