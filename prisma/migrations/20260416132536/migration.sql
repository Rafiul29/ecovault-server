-- AlterEnum
ALTER TYPE "IdeaStatus" ADD VALUE 'PUBLISHED';

-- AlterTable
ALTER TABLE "subscription_plan" ADD COLUMN     "buttonText" TEXT DEFAULT 'Get Started',
ADD COLUMN     "features" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "isPopular" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "subscription_plan_order_idx" ON "subscription_plan"("order");
