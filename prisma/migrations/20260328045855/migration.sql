/*
  Warnings:

  - The values [PREMIUM] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `currency` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `metadata` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `stripeSubId` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `bio` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `reputationScore` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `webhook_deliveries` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `webhooks` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('MEMBER', 'MODERATOR', 'ADMIN', 'SUPER_ADMIN');
ALTER TABLE "public"."users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "public"."Role_old";
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'MEMBER';
COMMIT;

-- DropForeignKey
ALTER TABLE "subscriptions" DROP CONSTRAINT "subscriptions_userId_fkey";

-- DropForeignKey
ALTER TABLE "webhook_deliveries" DROP CONSTRAINT "webhook_deliveries_webhookId_fkey";

-- DropForeignKey
ALTER TABLE "webhooks" DROP CONSTRAINT "webhooks_userId_fkey";

-- DropIndex
DROP INDEX "subscriptions_stripeSubId_idx";

-- DropIndex
DROP INDEX "subscriptions_stripeSubId_key";

-- AlterTable
ALTER TABLE "payments" DROP COLUMN "currency",
DROP COLUMN "metadata",
ADD COLUMN     "paymentGatewayData" JSONB;

-- AlterTable
ALTER TABLE "subscriptions" DROP COLUMN "stripeSubId",
ADD COLUMN     "paymentId" TEXT,
ADD COLUMN     "subscriptionPlanId" TEXT;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "bio",
DROP COLUMN "isActive",
DROP COLUMN "reputationScore";

-- DropTable
DROP TABLE "webhook_deliveries";

-- DropTable
DROP TABLE "webhooks";

-- CreateTable
CREATE TABLE "admins" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "profilePhoto" TEXT,
    "contactNumber" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription_plans" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "tier" "SubscriptionTier" NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "durationDays" INTEGER NOT NULL DEFAULT 30,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "moderators" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "profilePhoto" TEXT,
    "contactNumber" TEXT,
    "bio" TEXT,
    "address" TEXT,
    "phoneNumber" TEXT,
    "reputationScore" INTEGER NOT NULL DEFAULT 0,
    "socialLinks" JSONB,
    "onboarded" BOOLEAN NOT NULL DEFAULT false,
    "activityScore" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "assignNotes" TEXT,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "moderators_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "admins"("email");

-- CreateIndex
CREATE UNIQUE INDEX "admins_userId_key" ON "admins"("userId");

-- CreateIndex
CREATE INDEX "admins_userId_idx" ON "admins"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_plans_name_key" ON "subscription_plans"("name");

-- CreateIndex
CREATE INDEX "subscription_plans_isActive_idx" ON "subscription_plans"("isActive");

-- CreateIndex
CREATE INDEX "subscription_plans_price_idx" ON "subscription_plans"("price");

-- CreateIndex
CREATE UNIQUE INDEX "moderators_email_key" ON "moderators"("email");

-- CreateIndex
CREATE UNIQUE INDEX "moderators_userId_key" ON "moderators"("userId");

-- CreateIndex
CREATE INDEX "moderators_userId_idx" ON "moderators"("userId");

-- CreateIndex
CREATE INDEX "moderators_isActive_idx" ON "moderators"("isActive");

-- CreateIndex
CREATE INDEX "subscriptions_isActive_idx" ON "subscriptions"("isActive");

-- CreateIndex
CREATE INDEX "subscriptions_subscriptionPlanId_idx" ON "subscriptions"("subscriptionPlanId");

-- CreateIndex
CREATE INDEX "subscriptions_paymentId_idx" ON "subscriptions"("paymentId");

-- AddForeignKey
ALTER TABLE "admins" ADD CONSTRAINT "admins_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_subscriptionPlanId_fkey" FOREIGN KEY ("subscriptionPlanId") REFERENCES "subscription_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "moderators" ADD CONSTRAINT "moderators_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
