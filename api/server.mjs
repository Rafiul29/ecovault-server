var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/app.ts
import express10 from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { toNodeHandler } from "better-auth/node";

// src/app/lib/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { bearer, emailOTP } from "better-auth/plugins";

// src/generated/prisma/enums.ts
var Role = {
  MEMBER: "MEMBER",
  MODERATOR: "MODERATOR",
  ADMIN: "ADMIN",
  SUPER_ADMIN: "SUPER_ADMIN"
};
var UserStatus = {
  ACTIVE: "ACTIVE",
  BLOCKED: "BLOCKED",
  DELETED: "DELETED"
};
var IdeaStatus = {
  DRAFT: "DRAFT",
  UNDER_REVIEW: "UNDER_REVIEW",
  APPROVED: "APPROVED",
  PUBLISHED: "PUBLISHED",
  REJECTED: "REJECTED"
};
var PaymentStatus = {
  PENDING: "PENDING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
  REFUNDED: "REFUNDED"
};
var SubscriptionTier = {
  FREE: "FREE",
  BASIC: "BASIC",
  PRO: "PRO",
  ENTERPRISE: "ENTERPRISE"
};
var ReactionType = {
  LIKE: "LIKE",
  LOVE: "LOVE",
  INSIGHTFUL: "INSIGHTFUL",
  INSPIRING: "INSPIRING",
  CONCERNED: "CONCERNED"
};

// src/app/config/env.ts
import dotenv from "dotenv";
import status from "http-status";

// src/app/errorHelpers/AppError.ts
var AppError = class extends Error {
  statusCode;
  constructor(statusCode, message, stack = "") {
    super(message);
    this.statusCode = statusCode;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
};
var AppError_default = AppError;

// src/app/config/env.ts
dotenv.config();
var loadEnvVariables = () => {
  const requireEnvVariable = [
    "NODE_ENV",
    "PORT",
    "DATABASE_URL",
    "BETTER_AUTH_SECRET",
    "BETTER_AUTH_URL",
    "ACCESS_TOKEN_SECRET",
    "REFRESH_TOKEN_SECRET",
    "ACCESS_TOKEN_EXPIRES_IN",
    "REFRESH_TOKEN_EXPIRES_IN",
    "BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN",
    "BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE",
    "EMAIL_SENDER_SMTP_USER",
    "EMAIL_SENDER_SMTP_PASS",
    "EMAIL_SENDER_SMTP_HOST",
    "EMAIL_SENDER_SMTP_PORT",
    "EMAIL_SENDER_SMTP_FROM",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "GOOGLE_CALLBACK_URL",
    "FRONTEND_URL",
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "SUPER_ADMIN_EMAIL",
    "SUPER_ADMIN_PASSWORD",
    "OPENROUTER_API_KEY",
    "OPENROUTER_EMBEDDING_MODEL",
    "OPENROUTER_LLM_MODEL",
    "REDIS_URL"
  ];
  requireEnvVariable.forEach((variable) => {
    if (!process.env[variable]) {
      throw new AppError_default(status.INTERNAL_SERVER_ERROR, `Environment variable ${variable} is required but not set in .env file.`);
    }
  });
  return {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    DATABASE_URL: process.env.DATABASE_URL,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
    ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN,
    REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN,
    BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN: process.env.BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN,
    BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE: process.env.BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE,
    EMAIL_SENDER: {
      SMTP_USER: process.env.EMAIL_SENDER_SMTP_USER,
      SMTP_PASS: process.env.EMAIL_SENDER_SMTP_PASS,
      SMTP_HOST: process.env.EMAIL_SENDER_SMTP_HOST,
      SMTP_PORT: process.env.EMAIL_SENDER_SMTP_PORT,
      SMTP_FROM: process.env.EMAIL_SENDER_SMTP_FROM
    },
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL,
    FRONTEND_URL: process.env.FRONTEND_URL,
    CLOUDINARY: {
      CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
      CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
      CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET
    },
    STRIPE: {
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET
    },
    SUPER_ADMIN_EMAIL: process.env.SUPER_ADMIN_EMAIL,
    SUPER_ADMIN_PASSWORD: process.env.SUPER_ADMIN_PASSWORD,
    RAG: {
      OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
      OPENROUTER_EMBEDDING_MODEL: process.env.OPENROUTER_EMBEDDING_MODEL,
      OPENROUTER_LLM_MODEL: process.env.OPENROUTER_LLM_MODEL
    },
    REDIS_URL: process.env.REDIS_URL
  };
};
var envVars = loadEnvVariables();

// src/app/utils/email.ts
import ejs from "ejs";
import status2 from "http-status";
import nodemailer from "nodemailer";
import path from "path";
var transporter = nodemailer.createTransport({
  host: envVars.EMAIL_SENDER.SMTP_HOST,
  secure: true,
  auth: {
    user: envVars.EMAIL_SENDER.SMTP_USER,
    pass: envVars.EMAIL_SENDER.SMTP_PASS
  },
  port: Number(envVars.EMAIL_SENDER.SMTP_PORT)
});
var sendEmail = async ({ subject, templateData, templateName, to, attachments }) => {
  try {
    const templatePath = path.resolve(process.cwd(), `src/app/templates/${templateName}.ejs`);
    const html = await ejs.renderFile(templatePath, templateData);
    const info = await transporter.sendMail({
      from: envVars.EMAIL_SENDER.SMTP_FROM,
      to,
      subject,
      html,
      attachments: attachments?.map((attachment) => ({
        filename: attachment.filename,
        content: attachment.content,
        contentType: attachment.contentType
      }))
    });
    console.log(`Email sent to ${to} : ${info.messageId}`);
  } catch (error) {
    console.log("Email Sending Error", error.message);
    throw new AppError_default(status2.INTERNAL_SERVER_ERROR, "Failed to send email");
  }
};

// src/app/lib/prisma.ts
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";

// src/generated/prisma/client.ts
import * as path2 from "path";
import { fileURLToPath } from "url";

// src/generated/prisma/internal/class.ts
import * as runtime from "@prisma/client/runtime/client";
var config = {
  "previewFeatures": [
    "postgresqlExtensions"
  ],
  "clientVersion": "7.5.0",
  "engineVersion": "280c870be64f457428992c43c1f6d557fab6e29e",
  "activeProvider": "postgresql",
  "inlineSchema": 'model Admin {\n  id String @id @default(cuid())\n\n  name          String\n  email         String    @unique\n  profilePhoto  String?\n  contactNumber String?\n  isDeleted     Boolean   @default(false)\n  deletedAt     DateTime?\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  userId String @unique\n  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@index([userId])\n  @@map("admin")\n}\n\nmodel User {\n  id            String  @id\n  email         String  @unique\n  name          String\n  emailVerified Boolean @default(false)\n  image         String? // Better-Auth standard image\n\n  // Better-Auth Relations\n  accounts Account[]\n  sessions Session[]\n\n  // Application Relations\n  ideas            Idea[]\n  comments         Comment[]\n  votes            Vote[] // Standard voting for Ideas\n  commentReactions CommentReaction[]\n  notifications    Notification[]\n  payments         Payment[]\n  subscription     Subscription?\n  auditLogs        AuditLog[]        @relation("actor")\n  searchHistory    SearchHistory[]\n  purchasedIdeas   IdeaPurchase[]\n  watchlist        Watchlist[]\n  achievements     Achievement[]\n  reviewsPerformed IdeaReview[]      @relation("reviewer")\n\n  // Follow System\n  followers Follow[] @relation("following")\n  following Follow[] @relation("follower")\n\n  // Role-specific extension tables\n  moderator Moderator?\n  admin     Admin?\n\n  isDeleted          Boolean    @default(false)\n  deletedAt          DateTime?\n  status             UserStatus @default(ACTIVE)\n  role               Role       @default(MEMBER)\n  needPasswordChange Boolean    @default(false)\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  @@index([isDeleted])\n  @@index([status])\n  @@index([createdAt])\n  @@map("user")\n}\n\nmodel Session {\n  id        String   @id\n  expiresAt DateTime\n  token     String\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n  ipAddress String?\n  userAgent String?\n  userId    String\n  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@unique([token])\n  @@index([token])\n  @@index([userId])\n  @@map("session")\n}\n\nmodel Account {\n  id                    String    @id\n  accountId             String\n  providerId            String\n  userId                String\n  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)\n  accessToken           String?\n  refreshToken          String?\n  idToken               String?\n  accessTokenExpiresAt  DateTime?\n  refreshTokenExpiresAt DateTime?\n  scope                 String?\n  password              String?\n  createdAt             DateTime  @default(now())\n  updatedAt             DateTime  @updatedAt\n\n  @@index([userId])\n  @@map("account")\n}\n\nmodel Verification {\n  id         String   @id\n  identifier String\n  value      String\n  expiresAt  DateTime\n  createdAt  DateTime @default(now())\n  updatedAt  DateTime @updatedAt\n\n  @@index([identifier])\n  @@index([value])\n  @@map("verification")\n}\n\nmodel Payment {\n  id            String        @id @default(cuid())\n  amount        Float\n  status        PaymentStatus @default(PENDING)\n  transactionId String?       @unique\n  paymentMethod String? // sslcommerz, stripe, bKash\n\n  user   User   @relation(fields: [userId], references: [id])\n  userId String\n\n  paymentGatewayData Json? // RAW response from gateway\n\n  createdAt     DateTime       @default(now())\n  updatedAt     DateTime       @updatedAt\n  subscriptions Subscription[]\n\n  @@index([userId])\n  @@index([status])\n  @@map("payment")\n}\n\nmodel SubscriptionPlan {\n  id          String           @id @default(cuid())\n  name        String           @unique\n  description String?\n  tier        SubscriptionTier\n  price       Float\n\n  durationDays  Int            @default(30) // 30-day plan etc.\n  features      String[]       @default([]) // e.g. ["Browse all public ideas", "Submit up to 2 ideas/month", ...]\n  order         Int            @default(0) // To order the plans in the UI\n  isPopular     Boolean        @default(false)\n  buttonText    String?        @default("Get Started")\n  isActive      Boolean        @default(true)\n  createdAt     DateTime       @default(now())\n  updatedAt     DateTime       @updatedAt\n  subscriptions Subscription[]\n\n  @@index([isActive])\n  @@index([price])\n  @@index([order])\n  @@map("subscription_plan")\n}\n\nmodel Subscription {\n  id     String           @id @default(cuid())\n  tier   SubscriptionTier @default(FREE)\n  user   User             @relation(fields: [userId], references: [id], onDelete: Cascade)\n  userId String           @unique\n\n  startDate          DateTime          @default(now())\n  endDate            DateTime?\n  isActive           Boolean           @default(true)\n  autoRenew          Boolean           @default(true)\n  subscriptionPlanId String?\n  subscriptionPlan   SubscriptionPlan? @relation(fields: [subscriptionPlanId], references: [id])\n  paymentId          String?\n  payment            Payment?          @relation(fields: [paymentId], references: [id])\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  @@index([userId])\n  @@index([isActive])\n  @@index([subscriptionPlanId])\n  @@index([paymentId])\n  @@map("subscription")\n}\n\n// ============== CORE BUSINESS MODELS ==============\n\nmodel Idea {\n  id               String   @id @default(cuid())\n  title            String\n  slug             String?  @unique\n  description      String   @db.Text\n  problemStatement String   @db.Text\n  proposedSolution String   @db.Text\n  images           String[] // Cloudinary/S3 URLs\n\n  // Categorization & Labeling\n  categories IdeaCategory[]\n  tags       IdeaTag[]\n\n  // Ownership\n  author   User   @relation(fields: [authorId], references: [id])\n  authorId String\n\n  // Lifecycle\n  status        IdeaStatus @default(DRAFT)\n  adminFeedback String?    @db.Text\n  reviewedBy    String?\n  reviewedAt    DateTime?\n\n  // Commercials\n  isPaid Boolean @default(false)\n  price  Float?  @default(0)\n\n  // High-Impact/Featured\n  isFeatured Boolean   @default(false)\n  featuredAt DateTime?\n\n  // Metrics (Denormalized for performance)\n  viewCount     Int   @default(0)\n  upvoteCount   Int   @default(0)\n  downvoteCount Int   @default(0)\n  trendingScore Float @default(0)\n\n  // Full-text search support (PostgreSQL specific)\n  // Requires manual migration for GIN index\n  searchVector Unsupported("tsvector")?\n\n  // Relations\n  comments      Comment[]\n  votes         Vote[]\n  purchases     IdeaPurchase[]\n  watchlists    Watchlist[]\n  attachments   Attachment[]\n  reviewHistory IdeaReview[]\n\n  createdAt   DateTime  @default(now())\n  updatedAt   DateTime  @updatedAt\n  publishedAt DateTime?\n\n  isDeleted Boolean   @default(false)\n  deletedAt DateTime?\n\n  @@index([authorId])\n  @@index([status])\n  @@index([trendingScore(sort: Desc)])\n  @@index([createdAt(sort: Desc)])\n  @@map("idea")\n}\n\nmodel Category {\n  id          String         @id @default(cuid())\n  name        String         @unique\n  slug        String         @unique\n  description String?\n  icon        String?\n  color       String?\n  isActive    Boolean        @default(true)\n  ideas       IdeaCategory[]\n\n  isDeleted Boolean   @default(false)\n  deletedAt DateTime?\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  @@index([slug])\n  @@map("category")\n}\n\nmodel IdeaCategory {\n  ideaId     String @map("idea_id")\n  categoryId String @map("category_id")\n\n  idea     Idea     @relation(fields: [ideaId], references: [id], onDelete: Cascade)\n  category Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)\n\n  assignedAt DateTime @default(now()) @map("assigned_at")\n\n  @@id([ideaId, categoryId])\n  @@index([categoryId])\n  @@index([ideaId])\n  @@map("idea_category")\n}\n\nmodel Tag {\n  id    String    @id @default(cuid())\n  name  String    @unique\n  slug  String    @unique\n  ideas IdeaTag[]\n\n  isDeleted Boolean   @default(false)\n  deletedAt DateTime?\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  @@index([slug])\n  @@map("tag")\n}\n\nmodel IdeaTag {\n  ideaId String @map("idea_id")\n  tagId  String @map("tag_id")\n\n  idea Idea @relation(fields: [ideaId], references: [id], onDelete: Cascade)\n  tag  Tag  @relation(fields: [tagId], references: [id], onDelete: Cascade)\n\n  assignedAt DateTime @default(now()) @map("assigned_at")\n\n  @@id([ideaId, tagId])\n  @@index([tagId])\n  @@index([ideaId])\n  @@map("idea_tag")\n}\n\nmodel IdeaPurchase {\n  id        String @id @default(cuid())\n  user      User   @relation(fields: [userId], references: [id])\n  userId    String\n  idea      Idea   @relation(fields: [ideaId], references: [id])\n  ideaId    String\n  amount    Float\n  paymentId String // Reference to Payment.id\n\n  purchasedAt DateTime @default(now())\n\n  @@unique([userId, ideaId])\n  @@index([userId])\n  @@index([ideaId])\n  @@map("idea_purchase")\n}\n\nmodel Watchlist {\n  id     String @id @default(cuid())\n  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)\n  userId String\n  idea   Idea   @relation(fields: [ideaId], references: [id], onDelete: Cascade)\n  ideaId String\n\n  isDeleted Boolean   @default(false)\n  deletedAt DateTime?\n\n  createdAt DateTime @default(now())\n\n  @@unique([userId, ideaId])\n  @@index([userId])\n  @@index([ideaId])\n  @@map("watchlist")\n}\n\nmodel Attachment {\n  id     String  @id @default(cuid())\n  type   String // VIDEO, PDF, DOCUMENT\n  url    String\n  title  String?\n  idea   Idea    @relation(fields: [ideaId], references: [id], onDelete: Cascade)\n  ideaId String\n\n  createdAt DateTime @default(now())\n\n  @@index([ideaId])\n  @@map("attachment")\n}\n\nmodel IdeaReview {\n  id         String     @id @default(cuid())\n  idea       Idea       @relation(fields: [ideaId], references: [id], onDelete: Cascade)\n  ideaId     String\n  reviewer   User       @relation("reviewer", fields: [reviewerId], references: [id])\n  reviewerId String\n  status     IdeaStatus\n  feedback   String     @db.Text\n\n  isDeleted Boolean   @default(false)\n  deletedAt DateTime?\n\n  createdAt DateTime @default(now())\n\n  @@index([ideaId])\n  @@index([reviewerId])\n  @@map("idea_review")\n}\n\nmodel Comment {\n  id      String @id @default(cuid())\n  content String @db.Text\n\n  author   User   @relation(fields: [authorId], references: [id])\n  authorId String\n\n  idea   Idea   @relation(fields: [ideaId], references: [id], onDelete: Cascade)\n  ideaId String\n\n  // Nested comments support\n  parent   Comment?  @relation("CommentReplies", fields: [parentId], references: [id], onDelete: Cascade)\n  parentId String?\n  replies  Comment[] @relation("CommentReplies")\n\n  isDeleted Boolean @default(false)\n  isFlagged Boolean @default(false)\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  reactions CommentReaction[]\n\n  @@index([ideaId])\n  @@index([parentId])\n  @@index([authorId])\n  @@map("comment")\n}\n\nmodel CommentReaction {\n  userId    String       @map("user_id")\n  commentId String       @map("comment_id")\n  type      ReactionType\n\n  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)\n  comment Comment @relation(fields: [commentId], references: [id], onDelete: Cascade)\n\n  createdAt DateTime @default(now()) @map("created_at")\n\n  @@id([userId, commentId])\n  @@index([commentId])\n  @@index([userId])\n  @@map("comment_reaction")\n}\n\nmodel Vote {\n  id    String @id @default(cuid())\n  value Int // 1 for upvote, -1 for downvote\n\n  user   User   @relation(fields: [userId], references: [id])\n  userId String\n\n  idea   Idea   @relation(fields: [ideaId], references: [id], onDelete: Cascade)\n  ideaId String\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  @@unique([userId, ideaId]) // Ensuring one vote per user per idea\n  @@index([ideaId])\n  @@index([userId])\n  @@map("vote")\n}\n\nmodel Follow {\n  followerId  String @map("follower_id")\n  followingId String @map("following_id")\n\n  follower  User @relation("follower", fields: [followerId], references: [id], onDelete: Cascade)\n  following User @relation("following", fields: [followingId], references: [id], onDelete: Cascade)\n\n  createdAt DateTime @default(now()) @map("created_at")\n\n  @@id([followerId, followingId])\n  @@index([followingId])\n  @@index([followerId])\n  @@map("follow")\n}\n\nenum Role {\n  MEMBER\n  MODERATOR\n  ADMIN\n  SUPER_ADMIN\n}\n\nenum UserStatus {\n  ACTIVE\n  BLOCKED\n  DELETED\n}\n\nenum IdeaStatus {\n  DRAFT\n  UNDER_REVIEW\n  APPROVED\n  PUBLISHED\n  REJECTED\n}\n\nenum PaymentStatus {\n  PENDING\n  COMPLETED\n  FAILED\n  REFUNDED\n}\n\nenum NotificationType {\n  IDEA_APPROVED\n  IDEA_REJECTED\n  NEW_COMMENT\n  COMMENT_REPLY\n  VOTE_MILESTONE\n  PAYMENT_RECEIVED\n  SYSTEM_ANNOUNCEMENT\n}\n\nenum SubscriptionTier {\n  FREE\n  BASIC\n  PRO\n  ENTERPRISE\n}\n\nenum ReactionType {\n  LIKE\n  LOVE\n  INSIGHTFUL\n  INSPIRING\n  CONCERNED\n}\n\nmodel Moderator {\n  id String @id @default(cuid())\n\n  name          String\n  email         String  @unique\n  profilePhoto  String?\n  contactNumber String?\n\n  bio             String? @db.Text\n  address         String?\n  phoneNumber     String?\n  reputationScore Int     @default(0)\n  socialLinks     Json? // { twitter: "...", github: "..." }\n\n  // Metrics move here from redundant Member/Premium models\n  onboarded     Boolean @default(false)\n  activityScore Int     @default(0)\n\n  isActive    Boolean  @default(true)\n  assignNotes String?  @db.Text\n  assignedAt  DateTime @default(now())\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  isDeleted Boolean   @default(false)\n  deletedAt DateTime?\n\n  userId String @unique\n  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@index([userId])\n  @@index([isActive])\n  @@map("moderator")\n}\n\nmodel DocumentEmbedding {\n  id String @id @default(uuid(7))\n\n  chunkKey    String  @unique\n  sourceType  String\n  sourceId    String\n  sourceLabel String?\n  content     String\n  metadata    Json?\n\n  embedding Unsupported("vector(2048)")\n\n  isDeleted Boolean   @default(false)\n  deletedAt DateTime?\n  createdAt DateTime  @default(now())\n  updatedAt DateTime  @updatedAt\n\n  @@index([sourceType], name: "idx_document_embeddings_sourceType")\n  @@index([sourceId], name: "idx_document_embeddings_sourceId")\n  @@map("document_embeddings")\n}\n\n// This is your Prisma schema file,\n// learn more about it in the docs: https://pris.ly/d/prisma-schema\n\n// Get a free hosted Postgres database in seconds: `npx create-db`\n\ngenerator client {\n  provider        = "prisma-client"\n  output          = "../../src/generated/prisma"\n  previewFeatures = ["postgresqlExtensions"]\n}\n\ndatasource db {\n  provider   = "postgresql"\n  extensions = [vector]\n}\n\n// Models are split into file sets:\n// - auth.schema (User/Session/Account/Verification)\n// - business.schema (ideas/categories/comments/votes/payment/etc.)\n// - enums.prisma (shared enums)\n\nmodel Notification {\n  id      String           @id @default(cuid())\n  type    NotificationType\n  title   String\n  message String\n  isRead  Boolean          @default(false)\n  data    Json? // { link: "/ideas/123", icon: "approval" }\n\n  user   User   @relation(fields: [userId], references: [id])\n  userId String\n\n  createdAt DateTime @default(now())\n\n  @@index([userId, isRead])\n  @@map("notification")\n}\n\nmodel AuditLog {\n  id         String @id @default(cuid())\n  action     String // CREATE, UPDATE, DELETE, etc.\n  resource   String // Idea, User, Comment\n  resourceId String\n\n  actor   User   @relation("actor", fields: [actorId], references: [id])\n  actorId String\n\n  previousState Json?\n  newState      Json?\n  ipAddress     String?\n  userAgent     String?\n\n  createdAt DateTime @default(now())\n\n  @@index([resource, resourceId])\n  @@index([createdAt])\n  @@map("audit_log")\n}\n\nmodel SearchHistory {\n  id           String @id @default(cuid())\n  query        String\n  resultsCount Int\n\n  user   User   @relation(fields: [userId], references: [id])\n  userId String\n\n  createdAt DateTime @default(now())\n\n  @@index([userId])\n  @@map("search_historie")\n}\n\nmodel Newsletter {\n  id           String  @id @default(cuid())\n  email        String  @unique\n  isSubscribed Boolean @default(true)\n\n  createdAt DateTime @default(now())\n\n  @@map("newsletter")\n}\n\nmodel Achievement {\n  id          String  @id @default(cuid())\n  name        String\n  description String\n  icon        String?\n  user        User    @relation(fields: [userId], references: [id], onDelete: Cascade)\n  userId      String\n\n  earnedAt DateTime @default(now())\n\n  @@index([userId])\n  @@map("achievement")\n}\n',
  "runtimeDataModel": {
    "models": {},
    "enums": {},
    "types": {}
  },
  "parameterizationSchema": {
    "strings": [],
    "graph": ""
  }
};
config.runtimeDataModel = JSON.parse('{"models":{"Admin":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"profilePhoto","kind":"scalar","type":"String"},{"name":"contactNumber","kind":"scalar","type":"String"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"AdminToUser"}],"dbName":"admin"},"User":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"emailVerified","kind":"scalar","type":"Boolean"},{"name":"image","kind":"scalar","type":"String"},{"name":"accounts","kind":"object","type":"Account","relationName":"AccountToUser"},{"name":"sessions","kind":"object","type":"Session","relationName":"SessionToUser"},{"name":"ideas","kind":"object","type":"Idea","relationName":"IdeaToUser"},{"name":"comments","kind":"object","type":"Comment","relationName":"CommentToUser"},{"name":"votes","kind":"object","type":"Vote","relationName":"UserToVote"},{"name":"commentReactions","kind":"object","type":"CommentReaction","relationName":"CommentReactionToUser"},{"name":"notifications","kind":"object","type":"Notification","relationName":"NotificationToUser"},{"name":"payments","kind":"object","type":"Payment","relationName":"PaymentToUser"},{"name":"subscription","kind":"object","type":"Subscription","relationName":"SubscriptionToUser"},{"name":"auditLogs","kind":"object","type":"AuditLog","relationName":"actor"},{"name":"searchHistory","kind":"object","type":"SearchHistory","relationName":"SearchHistoryToUser"},{"name":"purchasedIdeas","kind":"object","type":"IdeaPurchase","relationName":"IdeaPurchaseToUser"},{"name":"watchlist","kind":"object","type":"Watchlist","relationName":"UserToWatchlist"},{"name":"achievements","kind":"object","type":"Achievement","relationName":"AchievementToUser"},{"name":"reviewsPerformed","kind":"object","type":"IdeaReview","relationName":"reviewer"},{"name":"followers","kind":"object","type":"Follow","relationName":"following"},{"name":"following","kind":"object","type":"Follow","relationName":"follower"},{"name":"moderator","kind":"object","type":"Moderator","relationName":"ModeratorToUser"},{"name":"admin","kind":"object","type":"Admin","relationName":"AdminToUser"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"status","kind":"enum","type":"UserStatus"},{"name":"role","kind":"enum","type":"Role"},{"name":"needPasswordChange","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"user"},"Session":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"token","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"ipAddress","kind":"scalar","type":"String"},{"name":"userAgent","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"SessionToUser"}],"dbName":"session"},"Account":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"accountId","kind":"scalar","type":"String"},{"name":"providerId","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"AccountToUser"},{"name":"accessToken","kind":"scalar","type":"String"},{"name":"refreshToken","kind":"scalar","type":"String"},{"name":"idToken","kind":"scalar","type":"String"},{"name":"accessTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"refreshTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"scope","kind":"scalar","type":"String"},{"name":"password","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"account"},"Verification":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"identifier","kind":"scalar","type":"String"},{"name":"value","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"verification"},"Payment":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"amount","kind":"scalar","type":"Float"},{"name":"status","kind":"enum","type":"PaymentStatus"},{"name":"transactionId","kind":"scalar","type":"String"},{"name":"paymentMethod","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"PaymentToUser"},{"name":"userId","kind":"scalar","type":"String"},{"name":"paymentGatewayData","kind":"scalar","type":"Json"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"subscriptions","kind":"object","type":"Subscription","relationName":"PaymentToSubscription"}],"dbName":"payment"},"SubscriptionPlan":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"tier","kind":"enum","type":"SubscriptionTier"},{"name":"price","kind":"scalar","type":"Float"},{"name":"durationDays","kind":"scalar","type":"Int"},{"name":"features","kind":"scalar","type":"String"},{"name":"order","kind":"scalar","type":"Int"},{"name":"isPopular","kind":"scalar","type":"Boolean"},{"name":"buttonText","kind":"scalar","type":"String"},{"name":"isActive","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"subscriptions","kind":"object","type":"Subscription","relationName":"SubscriptionToSubscriptionPlan"}],"dbName":"subscription_plan"},"Subscription":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"tier","kind":"enum","type":"SubscriptionTier"},{"name":"user","kind":"object","type":"User","relationName":"SubscriptionToUser"},{"name":"userId","kind":"scalar","type":"String"},{"name":"startDate","kind":"scalar","type":"DateTime"},{"name":"endDate","kind":"scalar","type":"DateTime"},{"name":"isActive","kind":"scalar","type":"Boolean"},{"name":"autoRenew","kind":"scalar","type":"Boolean"},{"name":"subscriptionPlanId","kind":"scalar","type":"String"},{"name":"subscriptionPlan","kind":"object","type":"SubscriptionPlan","relationName":"SubscriptionToSubscriptionPlan"},{"name":"paymentId","kind":"scalar","type":"String"},{"name":"payment","kind":"object","type":"Payment","relationName":"PaymentToSubscription"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"subscription"},"Idea":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"title","kind":"scalar","type":"String"},{"name":"slug","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"problemStatement","kind":"scalar","type":"String"},{"name":"proposedSolution","kind":"scalar","type":"String"},{"name":"images","kind":"scalar","type":"String"},{"name":"categories","kind":"object","type":"IdeaCategory","relationName":"IdeaToIdeaCategory"},{"name":"tags","kind":"object","type":"IdeaTag","relationName":"IdeaToIdeaTag"},{"name":"author","kind":"object","type":"User","relationName":"IdeaToUser"},{"name":"authorId","kind":"scalar","type":"String"},{"name":"status","kind":"enum","type":"IdeaStatus"},{"name":"adminFeedback","kind":"scalar","type":"String"},{"name":"reviewedBy","kind":"scalar","type":"String"},{"name":"reviewedAt","kind":"scalar","type":"DateTime"},{"name":"isPaid","kind":"scalar","type":"Boolean"},{"name":"price","kind":"scalar","type":"Float"},{"name":"isFeatured","kind":"scalar","type":"Boolean"},{"name":"featuredAt","kind":"scalar","type":"DateTime"},{"name":"viewCount","kind":"scalar","type":"Int"},{"name":"upvoteCount","kind":"scalar","type":"Int"},{"name":"downvoteCount","kind":"scalar","type":"Int"},{"name":"trendingScore","kind":"scalar","type":"Float"},{"name":"comments","kind":"object","type":"Comment","relationName":"CommentToIdea"},{"name":"votes","kind":"object","type":"Vote","relationName":"IdeaToVote"},{"name":"purchases","kind":"object","type":"IdeaPurchase","relationName":"IdeaToIdeaPurchase"},{"name":"watchlists","kind":"object","type":"Watchlist","relationName":"IdeaToWatchlist"},{"name":"attachments","kind":"object","type":"Attachment","relationName":"AttachmentToIdea"},{"name":"reviewHistory","kind":"object","type":"IdeaReview","relationName":"IdeaToIdeaReview"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"publishedAt","kind":"scalar","type":"DateTime"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"deletedAt","kind":"scalar","type":"DateTime"}],"dbName":"idea"},"Category":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"slug","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"icon","kind":"scalar","type":"String"},{"name":"color","kind":"scalar","type":"String"},{"name":"isActive","kind":"scalar","type":"Boolean"},{"name":"ideas","kind":"object","type":"IdeaCategory","relationName":"CategoryToIdeaCategory"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"category"},"IdeaCategory":{"fields":[{"name":"ideaId","kind":"scalar","type":"String","dbName":"idea_id"},{"name":"categoryId","kind":"scalar","type":"String","dbName":"category_id"},{"name":"idea","kind":"object","type":"Idea","relationName":"IdeaToIdeaCategory"},{"name":"category","kind":"object","type":"Category","relationName":"CategoryToIdeaCategory"},{"name":"assignedAt","kind":"scalar","type":"DateTime","dbName":"assigned_at"}],"dbName":"idea_category"},"Tag":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"slug","kind":"scalar","type":"String"},{"name":"ideas","kind":"object","type":"IdeaTag","relationName":"IdeaTagToTag"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"tag"},"IdeaTag":{"fields":[{"name":"ideaId","kind":"scalar","type":"String","dbName":"idea_id"},{"name":"tagId","kind":"scalar","type":"String","dbName":"tag_id"},{"name":"idea","kind":"object","type":"Idea","relationName":"IdeaToIdeaTag"},{"name":"tag","kind":"object","type":"Tag","relationName":"IdeaTagToTag"},{"name":"assignedAt","kind":"scalar","type":"DateTime","dbName":"assigned_at"}],"dbName":"idea_tag"},"IdeaPurchase":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"IdeaPurchaseToUser"},{"name":"userId","kind":"scalar","type":"String"},{"name":"idea","kind":"object","type":"Idea","relationName":"IdeaToIdeaPurchase"},{"name":"ideaId","kind":"scalar","type":"String"},{"name":"amount","kind":"scalar","type":"Float"},{"name":"paymentId","kind":"scalar","type":"String"},{"name":"purchasedAt","kind":"scalar","type":"DateTime"}],"dbName":"idea_purchase"},"Watchlist":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"UserToWatchlist"},{"name":"userId","kind":"scalar","type":"String"},{"name":"idea","kind":"object","type":"Idea","relationName":"IdeaToWatchlist"},{"name":"ideaId","kind":"scalar","type":"String"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"}],"dbName":"watchlist"},"Attachment":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"type","kind":"scalar","type":"String"},{"name":"url","kind":"scalar","type":"String"},{"name":"title","kind":"scalar","type":"String"},{"name":"idea","kind":"object","type":"Idea","relationName":"AttachmentToIdea"},{"name":"ideaId","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"}],"dbName":"attachment"},"IdeaReview":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"idea","kind":"object","type":"Idea","relationName":"IdeaToIdeaReview"},{"name":"ideaId","kind":"scalar","type":"String"},{"name":"reviewer","kind":"object","type":"User","relationName":"reviewer"},{"name":"reviewerId","kind":"scalar","type":"String"},{"name":"status","kind":"enum","type":"IdeaStatus"},{"name":"feedback","kind":"scalar","type":"String"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"}],"dbName":"idea_review"},"Comment":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"content","kind":"scalar","type":"String"},{"name":"author","kind":"object","type":"User","relationName":"CommentToUser"},{"name":"authorId","kind":"scalar","type":"String"},{"name":"idea","kind":"object","type":"Idea","relationName":"CommentToIdea"},{"name":"ideaId","kind":"scalar","type":"String"},{"name":"parent","kind":"object","type":"Comment","relationName":"CommentReplies"},{"name":"parentId","kind":"scalar","type":"String"},{"name":"replies","kind":"object","type":"Comment","relationName":"CommentReplies"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"isFlagged","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"reactions","kind":"object","type":"CommentReaction","relationName":"CommentToCommentReaction"}],"dbName":"comment"},"CommentReaction":{"fields":[{"name":"userId","kind":"scalar","type":"String","dbName":"user_id"},{"name":"commentId","kind":"scalar","type":"String","dbName":"comment_id"},{"name":"type","kind":"enum","type":"ReactionType"},{"name":"user","kind":"object","type":"User","relationName":"CommentReactionToUser"},{"name":"comment","kind":"object","type":"Comment","relationName":"CommentToCommentReaction"},{"name":"createdAt","kind":"scalar","type":"DateTime","dbName":"created_at"}],"dbName":"comment_reaction"},"Vote":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"value","kind":"scalar","type":"Int"},{"name":"user","kind":"object","type":"User","relationName":"UserToVote"},{"name":"userId","kind":"scalar","type":"String"},{"name":"idea","kind":"object","type":"Idea","relationName":"IdeaToVote"},{"name":"ideaId","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"vote"},"Follow":{"fields":[{"name":"followerId","kind":"scalar","type":"String","dbName":"follower_id"},{"name":"followingId","kind":"scalar","type":"String","dbName":"following_id"},{"name":"follower","kind":"object","type":"User","relationName":"follower"},{"name":"following","kind":"object","type":"User","relationName":"following"},{"name":"createdAt","kind":"scalar","type":"DateTime","dbName":"created_at"}],"dbName":"follow"},"Moderator":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"profilePhoto","kind":"scalar","type":"String"},{"name":"contactNumber","kind":"scalar","type":"String"},{"name":"bio","kind":"scalar","type":"String"},{"name":"address","kind":"scalar","type":"String"},{"name":"phoneNumber","kind":"scalar","type":"String"},{"name":"reputationScore","kind":"scalar","type":"Int"},{"name":"socialLinks","kind":"scalar","type":"Json"},{"name":"onboarded","kind":"scalar","type":"Boolean"},{"name":"activityScore","kind":"scalar","type":"Int"},{"name":"isActive","kind":"scalar","type":"Boolean"},{"name":"assignNotes","kind":"scalar","type":"String"},{"name":"assignedAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"ModeratorToUser"}],"dbName":"moderator"},"DocumentEmbedding":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"chunkKey","kind":"scalar","type":"String"},{"name":"sourceType","kind":"scalar","type":"String"},{"name":"sourceId","kind":"scalar","type":"String"},{"name":"sourceLabel","kind":"scalar","type":"String"},{"name":"content","kind":"scalar","type":"String"},{"name":"metadata","kind":"scalar","type":"Json"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"document_embeddings"},"Notification":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"type","kind":"enum","type":"NotificationType"},{"name":"title","kind":"scalar","type":"String"},{"name":"message","kind":"scalar","type":"String"},{"name":"isRead","kind":"scalar","type":"Boolean"},{"name":"data","kind":"scalar","type":"Json"},{"name":"user","kind":"object","type":"User","relationName":"NotificationToUser"},{"name":"userId","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"}],"dbName":"notification"},"AuditLog":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"action","kind":"scalar","type":"String"},{"name":"resource","kind":"scalar","type":"String"},{"name":"resourceId","kind":"scalar","type":"String"},{"name":"actor","kind":"object","type":"User","relationName":"actor"},{"name":"actorId","kind":"scalar","type":"String"},{"name":"previousState","kind":"scalar","type":"Json"},{"name":"newState","kind":"scalar","type":"Json"},{"name":"ipAddress","kind":"scalar","type":"String"},{"name":"userAgent","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"}],"dbName":"audit_log"},"SearchHistory":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"query","kind":"scalar","type":"String"},{"name":"resultsCount","kind":"scalar","type":"Int"},{"name":"user","kind":"object","type":"User","relationName":"SearchHistoryToUser"},{"name":"userId","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"}],"dbName":"search_historie"},"Newsletter":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"isSubscribed","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"}],"dbName":"newsletter"},"Achievement":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"icon","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"AchievementToUser"},{"name":"userId","kind":"scalar","type":"String"},{"name":"earnedAt","kind":"scalar","type":"DateTime"}],"dbName":"achievement"}},"enums":{},"types":{}}');
config.parameterizationSchema = {
  strings: JSON.parse('["where","orderBy","cursor","user","accounts","sessions","idea","ideas","_count","category","categories","tag","tags","author","parent","replies","comment","reactions","comments","votes","purchases","watchlists","attachments","reviewer","reviewHistory","commentReactions","notifications","subscriptions","subscriptionPlan","payment","payments","subscription","actor","auditLogs","searchHistory","purchasedIdeas","watchlist","achievements","reviewsPerformed","follower","following","followers","moderator","admin","Admin.findUnique","Admin.findUniqueOrThrow","Admin.findFirst","Admin.findFirstOrThrow","Admin.findMany","data","Admin.createOne","Admin.createMany","Admin.createManyAndReturn","Admin.updateOne","Admin.updateMany","Admin.updateManyAndReturn","create","update","Admin.upsertOne","Admin.deleteOne","Admin.deleteMany","having","_min","_max","Admin.groupBy","Admin.aggregate","User.findUnique","User.findUniqueOrThrow","User.findFirst","User.findFirstOrThrow","User.findMany","User.createOne","User.createMany","User.createManyAndReturn","User.updateOne","User.updateMany","User.updateManyAndReturn","User.upsertOne","User.deleteOne","User.deleteMany","User.groupBy","User.aggregate","Session.findUnique","Session.findUniqueOrThrow","Session.findFirst","Session.findFirstOrThrow","Session.findMany","Session.createOne","Session.createMany","Session.createManyAndReturn","Session.updateOne","Session.updateMany","Session.updateManyAndReturn","Session.upsertOne","Session.deleteOne","Session.deleteMany","Session.groupBy","Session.aggregate","Account.findUnique","Account.findUniqueOrThrow","Account.findFirst","Account.findFirstOrThrow","Account.findMany","Account.createOne","Account.createMany","Account.createManyAndReturn","Account.updateOne","Account.updateMany","Account.updateManyAndReturn","Account.upsertOne","Account.deleteOne","Account.deleteMany","Account.groupBy","Account.aggregate","Verification.findUnique","Verification.findUniqueOrThrow","Verification.findFirst","Verification.findFirstOrThrow","Verification.findMany","Verification.createOne","Verification.createMany","Verification.createManyAndReturn","Verification.updateOne","Verification.updateMany","Verification.updateManyAndReturn","Verification.upsertOne","Verification.deleteOne","Verification.deleteMany","Verification.groupBy","Verification.aggregate","Payment.findUnique","Payment.findUniqueOrThrow","Payment.findFirst","Payment.findFirstOrThrow","Payment.findMany","Payment.createOne","Payment.createMany","Payment.createManyAndReturn","Payment.updateOne","Payment.updateMany","Payment.updateManyAndReturn","Payment.upsertOne","Payment.deleteOne","Payment.deleteMany","_avg","_sum","Payment.groupBy","Payment.aggregate","SubscriptionPlan.findUnique","SubscriptionPlan.findUniqueOrThrow","SubscriptionPlan.findFirst","SubscriptionPlan.findFirstOrThrow","SubscriptionPlan.findMany","SubscriptionPlan.createOne","SubscriptionPlan.createMany","SubscriptionPlan.createManyAndReturn","SubscriptionPlan.updateOne","SubscriptionPlan.updateMany","SubscriptionPlan.updateManyAndReturn","SubscriptionPlan.upsertOne","SubscriptionPlan.deleteOne","SubscriptionPlan.deleteMany","SubscriptionPlan.groupBy","SubscriptionPlan.aggregate","Subscription.findUnique","Subscription.findUniqueOrThrow","Subscription.findFirst","Subscription.findFirstOrThrow","Subscription.findMany","Subscription.createOne","Subscription.createMany","Subscription.createManyAndReturn","Subscription.updateOne","Subscription.updateMany","Subscription.updateManyAndReturn","Subscription.upsertOne","Subscription.deleteOne","Subscription.deleteMany","Subscription.groupBy","Subscription.aggregate","Idea.findUnique","Idea.findUniqueOrThrow","Idea.findFirst","Idea.findFirstOrThrow","Idea.findMany","Idea.createOne","Idea.createMany","Idea.createManyAndReturn","Idea.updateOne","Idea.updateMany","Idea.updateManyAndReturn","Idea.upsertOne","Idea.deleteOne","Idea.deleteMany","Idea.groupBy","Idea.aggregate","Category.findUnique","Category.findUniqueOrThrow","Category.findFirst","Category.findFirstOrThrow","Category.findMany","Category.createOne","Category.createMany","Category.createManyAndReturn","Category.updateOne","Category.updateMany","Category.updateManyAndReturn","Category.upsertOne","Category.deleteOne","Category.deleteMany","Category.groupBy","Category.aggregate","IdeaCategory.findUnique","IdeaCategory.findUniqueOrThrow","IdeaCategory.findFirst","IdeaCategory.findFirstOrThrow","IdeaCategory.findMany","IdeaCategory.createOne","IdeaCategory.createMany","IdeaCategory.createManyAndReturn","IdeaCategory.updateOne","IdeaCategory.updateMany","IdeaCategory.updateManyAndReturn","IdeaCategory.upsertOne","IdeaCategory.deleteOne","IdeaCategory.deleteMany","IdeaCategory.groupBy","IdeaCategory.aggregate","Tag.findUnique","Tag.findUniqueOrThrow","Tag.findFirst","Tag.findFirstOrThrow","Tag.findMany","Tag.createOne","Tag.createMany","Tag.createManyAndReturn","Tag.updateOne","Tag.updateMany","Tag.updateManyAndReturn","Tag.upsertOne","Tag.deleteOne","Tag.deleteMany","Tag.groupBy","Tag.aggregate","IdeaTag.findUnique","IdeaTag.findUniqueOrThrow","IdeaTag.findFirst","IdeaTag.findFirstOrThrow","IdeaTag.findMany","IdeaTag.createOne","IdeaTag.createMany","IdeaTag.createManyAndReturn","IdeaTag.updateOne","IdeaTag.updateMany","IdeaTag.updateManyAndReturn","IdeaTag.upsertOne","IdeaTag.deleteOne","IdeaTag.deleteMany","IdeaTag.groupBy","IdeaTag.aggregate","IdeaPurchase.findUnique","IdeaPurchase.findUniqueOrThrow","IdeaPurchase.findFirst","IdeaPurchase.findFirstOrThrow","IdeaPurchase.findMany","IdeaPurchase.createOne","IdeaPurchase.createMany","IdeaPurchase.createManyAndReturn","IdeaPurchase.updateOne","IdeaPurchase.updateMany","IdeaPurchase.updateManyAndReturn","IdeaPurchase.upsertOne","IdeaPurchase.deleteOne","IdeaPurchase.deleteMany","IdeaPurchase.groupBy","IdeaPurchase.aggregate","Watchlist.findUnique","Watchlist.findUniqueOrThrow","Watchlist.findFirst","Watchlist.findFirstOrThrow","Watchlist.findMany","Watchlist.createOne","Watchlist.createMany","Watchlist.createManyAndReturn","Watchlist.updateOne","Watchlist.updateMany","Watchlist.updateManyAndReturn","Watchlist.upsertOne","Watchlist.deleteOne","Watchlist.deleteMany","Watchlist.groupBy","Watchlist.aggregate","Attachment.findUnique","Attachment.findUniqueOrThrow","Attachment.findFirst","Attachment.findFirstOrThrow","Attachment.findMany","Attachment.createOne","Attachment.createMany","Attachment.createManyAndReturn","Attachment.updateOne","Attachment.updateMany","Attachment.updateManyAndReturn","Attachment.upsertOne","Attachment.deleteOne","Attachment.deleteMany","Attachment.groupBy","Attachment.aggregate","IdeaReview.findUnique","IdeaReview.findUniqueOrThrow","IdeaReview.findFirst","IdeaReview.findFirstOrThrow","IdeaReview.findMany","IdeaReview.createOne","IdeaReview.createMany","IdeaReview.createManyAndReturn","IdeaReview.updateOne","IdeaReview.updateMany","IdeaReview.updateManyAndReturn","IdeaReview.upsertOne","IdeaReview.deleteOne","IdeaReview.deleteMany","IdeaReview.groupBy","IdeaReview.aggregate","Comment.findUnique","Comment.findUniqueOrThrow","Comment.findFirst","Comment.findFirstOrThrow","Comment.findMany","Comment.createOne","Comment.createMany","Comment.createManyAndReturn","Comment.updateOne","Comment.updateMany","Comment.updateManyAndReturn","Comment.upsertOne","Comment.deleteOne","Comment.deleteMany","Comment.groupBy","Comment.aggregate","CommentReaction.findUnique","CommentReaction.findUniqueOrThrow","CommentReaction.findFirst","CommentReaction.findFirstOrThrow","CommentReaction.findMany","CommentReaction.createOne","CommentReaction.createMany","CommentReaction.createManyAndReturn","CommentReaction.updateOne","CommentReaction.updateMany","CommentReaction.updateManyAndReturn","CommentReaction.upsertOne","CommentReaction.deleteOne","CommentReaction.deleteMany","CommentReaction.groupBy","CommentReaction.aggregate","Vote.findUnique","Vote.findUniqueOrThrow","Vote.findFirst","Vote.findFirstOrThrow","Vote.findMany","Vote.createOne","Vote.createMany","Vote.createManyAndReturn","Vote.updateOne","Vote.updateMany","Vote.updateManyAndReturn","Vote.upsertOne","Vote.deleteOne","Vote.deleteMany","Vote.groupBy","Vote.aggregate","Follow.findUnique","Follow.findUniqueOrThrow","Follow.findFirst","Follow.findFirstOrThrow","Follow.findMany","Follow.createOne","Follow.createMany","Follow.createManyAndReturn","Follow.updateOne","Follow.updateMany","Follow.updateManyAndReturn","Follow.upsertOne","Follow.deleteOne","Follow.deleteMany","Follow.groupBy","Follow.aggregate","Moderator.findUnique","Moderator.findUniqueOrThrow","Moderator.findFirst","Moderator.findFirstOrThrow","Moderator.findMany","Moderator.createOne","Moderator.createMany","Moderator.createManyAndReturn","Moderator.updateOne","Moderator.updateMany","Moderator.updateManyAndReturn","Moderator.upsertOne","Moderator.deleteOne","Moderator.deleteMany","Moderator.groupBy","Moderator.aggregate","DocumentEmbedding.findUnique","DocumentEmbedding.findUniqueOrThrow","DocumentEmbedding.findFirst","DocumentEmbedding.findFirstOrThrow","DocumentEmbedding.findMany","DocumentEmbedding.updateOne","DocumentEmbedding.updateMany","DocumentEmbedding.updateManyAndReturn","DocumentEmbedding.deleteOne","DocumentEmbedding.deleteMany","DocumentEmbedding.groupBy","DocumentEmbedding.aggregate","Notification.findUnique","Notification.findUniqueOrThrow","Notification.findFirst","Notification.findFirstOrThrow","Notification.findMany","Notification.createOne","Notification.createMany","Notification.createManyAndReturn","Notification.updateOne","Notification.updateMany","Notification.updateManyAndReturn","Notification.upsertOne","Notification.deleteOne","Notification.deleteMany","Notification.groupBy","Notification.aggregate","AuditLog.findUnique","AuditLog.findUniqueOrThrow","AuditLog.findFirst","AuditLog.findFirstOrThrow","AuditLog.findMany","AuditLog.createOne","AuditLog.createMany","AuditLog.createManyAndReturn","AuditLog.updateOne","AuditLog.updateMany","AuditLog.updateManyAndReturn","AuditLog.upsertOne","AuditLog.deleteOne","AuditLog.deleteMany","AuditLog.groupBy","AuditLog.aggregate","SearchHistory.findUnique","SearchHistory.findUniqueOrThrow","SearchHistory.findFirst","SearchHistory.findFirstOrThrow","SearchHistory.findMany","SearchHistory.createOne","SearchHistory.createMany","SearchHistory.createManyAndReturn","SearchHistory.updateOne","SearchHistory.updateMany","SearchHistory.updateManyAndReturn","SearchHistory.upsertOne","SearchHistory.deleteOne","SearchHistory.deleteMany","SearchHistory.groupBy","SearchHistory.aggregate","Newsletter.findUnique","Newsletter.findUniqueOrThrow","Newsletter.findFirst","Newsletter.findFirstOrThrow","Newsletter.findMany","Newsletter.createOne","Newsletter.createMany","Newsletter.createManyAndReturn","Newsletter.updateOne","Newsletter.updateMany","Newsletter.updateManyAndReturn","Newsletter.upsertOne","Newsletter.deleteOne","Newsletter.deleteMany","Newsletter.groupBy","Newsletter.aggregate","Achievement.findUnique","Achievement.findUniqueOrThrow","Achievement.findFirst","Achievement.findFirstOrThrow","Achievement.findMany","Achievement.createOne","Achievement.createMany","Achievement.createManyAndReturn","Achievement.updateOne","Achievement.updateMany","Achievement.updateManyAndReturn","Achievement.upsertOne","Achievement.deleteOne","Achievement.deleteMany","Achievement.groupBy","Achievement.aggregate","AND","OR","NOT","id","name","description","icon","userId","earnedAt","equals","in","notIn","lt","lte","gt","gte","not","contains","startsWith","endsWith","email","isSubscribed","createdAt","query","resultsCount","action","resource","resourceId","actorId","previousState","newState","ipAddress","userAgent","string_contains","string_starts_with","string_ends_with","array_starts_with","array_ends_with","array_contains","NotificationType","type","title","message","isRead","chunkKey","sourceType","sourceId","sourceLabel","content","metadata","isDeleted","deletedAt","updatedAt","profilePhoto","contactNumber","bio","address","phoneNumber","reputationScore","socialLinks","onboarded","activityScore","isActive","assignNotes","assignedAt","followerId","followingId","value","ideaId","commentId","ReactionType","authorId","parentId","isFlagged","reviewerId","IdeaStatus","status","feedback","url","amount","paymentId","purchasedAt","tagId","slug","every","some","none","categoryId","color","problemStatement","proposedSolution","images","adminFeedback","reviewedBy","reviewedAt","isPaid","price","isFeatured","featuredAt","viewCount","upvoteCount","downvoteCount","trendingScore","publishedAt","has","hasEvery","hasSome","SubscriptionTier","tier","startDate","endDate","autoRenew","subscriptionPlanId","durationDays","features","order","isPopular","buttonText","PaymentStatus","transactionId","paymentMethod","paymentGatewayData","identifier","expiresAt","accountId","providerId","accessToken","refreshToken","idToken","accessTokenExpiresAt","refreshTokenExpiresAt","scope","password","token","emailVerified","image","UserStatus","Role","role","needPasswordChange","followerId_followingId","userId_ideaId","userId_commentId","ideaId_tagId","ideaId_categoryId","is","isNot","connectOrCreate","upsert","createMany","set","disconnect","delete","connect","updateMany","deleteMany","push","increment","decrement","multiply","divide"]'),
  graph: "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_gQAAIwHACADAAAAIQAgAQAAIgAwAgAAIwAgAQAAABsAIAEAAAAhACALAwAAqQYAIAYAAIQHACDwAwAAiwcAMPEDAAAnABDyAwAAiwcAMPMDAQCQBgAh9wMBAJAGACGGBEAAkgYAIaQEQACSBgAhswQCAKgGACG0BAEAkAYAIQIDAADIBwAgBgAAhQwAIAwDAACpBgAgBgAAhAcAIPADAACLBwAw8QMAACcAEPIDAACLBwAw8wMBAAAAAfcDAQCQBgAhhgRAAJIGACGkBEAAkgYAIbMEAgCoBgAhtAQBAJAGACH9BAAAigcAIAMAAAAnACABAAAoADACAAApACALAwAAqQYAIAYAAIQHACDwAwAAiQcAMPEDAAArABDyAwAAiQcAMPMDAQCQBgAh9wMBAJAGACG0BAEAkAYAIb8ECADOBgAhwAQBAJAGACHBBEAAkgYAIQIDAADIBwAgBgAAhQwAIAwDAACpBgAgBgAAhAcAIPADAACJBwAw8QMAACsAEPIDAACJBwAw8wMBAAAAAfcDAQCQBgAhtAQBAJAGACG_BAgAzgYAIcAEAQCQBgAhwQRAAJIGACH9BAAAiAcAIAMAAAArACABAAAsADACAAAtACALAwAAqQYAIAYAAIQHACDwAwAAhwcAMPEDAAAvABDyAwAAhwcAMPMDAQCQBgAh9wMBAJAGACGGBEAAkgYAIaIEIACRBgAhowRAAKUGACG0BAEAkAYAIQMDAADIBwAgBgAAhQwAIKMEAACdBwAgDAMAAKkGACAGAACEBwAg8AMAAIcHADDxAwAALwAQ8gMAAIcHADDzAwEAAAAB9wMBAJAGACGGBEAAkgYAIaIEIACRBgAhowRAAKUGACG0BAEAkAYAIf0EAACGBwAgAwAAAC8AIAEAADAAMAIAADEAIAoGAACEBwAg8AMAAIUHADDxAwAAMwAQ8gMAAIUHADDzAwEAkAYAIYYEQACSBgAhmAQBAJAGACGZBAEAowYAIbQEAQCQBgAhvgQBAJAGACECBgAAhQwAIJkEAACdBwAgCgYAAIQHACDwAwAAhQcAMPEDAAAzABDyAwAAhQcAMPMDAQAAAAGGBEAAkgYAIZgEAQCQBgAhmQQBAKMGACG0BAEAkAYAIb4EAQCQBgAhAwAAADMAIAEAADQAMAIAADUAIA0GAACEBwAgFwAAqQYAIPADAACCBwAw8QMAADcAEPIDAACCBwAw8wMBAJAGACGGBEAAkgYAIaIEIACRBgAhowRAAKUGACG0BAEAkAYAIboEAQCQBgAhvAQAAIMHvAQivQQBAJAGACEDBgAAhQwAIBcAAMgHACCjBAAAnQcAIA0GAACEBwAgFwAAqQYAIPADAACCBwAw8QMAADcAEPIDAACCBwAw8wMBAAAAAYYEQACSBgAhogQgAJEGACGjBEAApQYAIbQEAQCQBgAhugQBAJAGACG8BAAAgwe8BCK9BAEAkAYAIQMAAAA3ACABAAA4ADACAAA5ACABAAAADwAgAQAAABUAIAEAAAAbACABAAAAJwAgAQAAACsAIAEAAAAvACABAAAAMwAgAQAAADcAIAMAAAAbACABAAAcADACAAAdACADAAAAJwAgAQAAKAAwAgAAKQAgAwAAACEAIAEAACIAMAIAACMAIAwDAACpBgAgMQAApAYAIPADAACABwAw8QMAAEYAEPIDAACABwAw8wMBAJAGACH3AwEAkAYAIYYEQACSBgAhmAQAAIEHmAQimQQBAJAGACGaBAEAkAYAIZsEIACRBgAhAgMAAMgHACAxAACdBwAgDAMAAKkGACAxAACkBgAg8AMAAIAHADDxAwAARgAQ8gMAAIAHADDzAwEAAAAB9wMBAJAGACGGBEAAkgYAIZgEAACBB5gEIpkEAQCQBgAhmgQBAJAGACGbBCAAkQYAIQMAAABGACABAABHADACAABIACAOAwAAqQYAIBsAAM8GACDwAwAA_gYAMPEDAABKABDyAwAA_gYAMPMDAQCQBgAh9wMBAJAGACGGBEAAkgYAIaQEQACSBgAhvAQAAP8G5wQivwQIAM4GACHnBAEAowYAIegEAQCjBgAh6QQAAKQGACAFAwAAyAcAIBsAAOYJACDnBAAAnQcAIOgEAACdBwAg6QQAAJ0HACAOAwAAqQYAIBsAAM8GACDwAwAA_gYAMPEDAABKABDyAwAA_gYAMPMDAQAAAAH3AwEAkAYAIYYEQACSBgAhpARAAJIGACG8BAAA_wbnBCK_BAgAzgYAIecEAQAAAAHoBAEAowYAIekEAACkBgAgAwAAAEoAIAEAAEsAMAIAAEwAIBEDAACpBgAgHAAA_AYAIB0AAP0GACDwAwAA-wYAMPEDAABOABDyAwAA-wYAMPMDAQCQBgAh9wMBAJAGACGGBEAAkgYAIaQEQACSBgAhrgQgAJEGACHABAEAowYAIdwEAADNBtwEIt0EQACSBgAh3gRAAKUGACHfBCAAkQYAIeAEAQCjBgAhBgMAAMgHACAcAACDDAAgHQAAhAwAIMAEAACdBwAg3gQAAJ0HACDgBAAAnQcAIBEDAACpBgAgHAAA_AYAIB0AAP0GACDwAwAA-wYAMPEDAABOABDyAwAA-wYAMPMDAQAAAAH3AwEAAAABhgRAAJIGACGkBEAAkgYAIa4EIACRBgAhwAQBAKMGACHcBAAAzQbcBCLdBEAAkgYAId4EQAClBgAh3wQgAJEGACHgBAEAowYAIQMAAABOACABAABPADACAABQACARGwAAzwYAIPADAADMBgAw8QMAAFIAEPIDAADMBgAw8wMBAJAGACH0AwEAkAYAIfUDAQCjBgAhhgRAAJIGACGkBEAAkgYAIa4EIACRBgAh0AQIAM4GACHcBAAAzQbcBCLhBAIAqAYAIeIEAADDBgAg4wQCAKgGACHkBCAAkQYAIeUEAQCjBgAhAQAAAFIAIAMAAABOACABAABPADACAABQACABAAAATgAgAQAAAEoAIAEAAABOACABAAAATgAgDiAAAKkGACDwAwAA-gYAMPEDAABZABDyAwAA-gYAMPMDAQCQBgAhhgRAAJIGACGJBAEAkAYAIYoEAQCQBgAhiwQBAJAGACGMBAEAkAYAIY0EAACkBgAgjgQAAKQGACCPBAEAowYAIZAEAQCjBgAhBSAAAMgHACCNBAAAnQcAII4EAACdBwAgjwQAAJ0HACCQBAAAnQcAIA4gAACpBgAg8AMAAPoGADDxAwAAWQAQ8gMAAPoGADDzAwEAAAABhgRAAJIGACGJBAEAkAYAIYoEAQCQBgAhiwQBAJAGACGMBAEAkAYAIY0EAACkBgAgjgQAAKQGACCPBAEAowYAIZAEAQCjBgAhAwAAAFkAIAEAAFoAMAIAAFsAIAkDAACpBgAg8AMAAPkGADDxAwAAXQAQ8gMAAPkGADDzAwEAkAYAIfcDAQCQBgAhhgRAAJIGACGHBAEAkAYAIYgEAgCoBgAhAQMAAMgHACAJAwAAqQYAIPADAAD5BgAw8QMAAF0AEPIDAAD5BgAw8wMBAAAAAfcDAQCQBgAhhgRAAJIGACGHBAEAkAYAIYgEAgCoBgAhAwAAAF0AIAEAAF4AMAIAAF8AIAMAAAArACABAAAsADACAAAtACADAAAALwAgAQAAMAAwAgAAMQAgCgMAAKkGACDwAwAA-AYAMPEDAABjABDyAwAA-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-gQAAOEG-gQi-wQgAJEGACEVBAAA7AsAIAUAAO0LACAHAADuCwAgEgAA7wsAIBMAAPALACAZAADxCwAgGgAA8gsAIB4AAPMLACAfAAD0CwAgIQAA9QsAICIAAPYLACAjAAD3CwAgJAAA-AsAICUAAPkLACAmAAD6CwAgKAAA-wsAICkAAPsLACAqAAD8CwAgKwAA_QsAIKMEAACdBwAg9wQAAJ0HACADAAAAmgEAIAEAAJsBADACAACXAQAgAwAAAJoBACABAACbAQAwAgAAlwEAIAMAAACaAQAgAQAAmwEAMAIAAJcBACAfBAAA2QsAIAUAANoLACAHAADbCwAgEgAA3AsAIBMAAN0LACAZAADeCwAgGgAA3wsAIB4AAOALACAfAADhCwAgIQAA4gsAICIAAOMLACAjAADkCwAgJAAA5QsAICUAAOYLACAmAADnCwAgKAAA6QsAICkAAOgLACAqAADqCwAgKwAA6wsAIPMDAQAAAAH0AwEAAAABhAQBAAAAAYYEQAAAAAGiBCAAAAABowRAAAAAAaQEQAAAAAG8BAAAAPkEAvYEIAAAAAH3BAEAAAAB-gQAAAD6BAL7BCAAAAABATEAAJ8BACAM8wMBAAAAAfQDAQAAAAGEBAEAAAABhgRAAAAAAaIEIAAAAAGjBEAAAAABpARAAAAAAbwEAAAA-QQC9gQgAAAAAfcEAQAAAAH6BAAAAPoEAvsEIAAAAAEBMQAAoQEAMAExAAChAQAwHwQAAIwKACAFAACNCgAgBwAAjgoAIBIAAI8KACATAACQCgAgGQAAkQoAIBoAAJIKACAeAACTCgAgHwAAlAoAICEAAJUKACAiAACWCgAgIwAAlwoAICQAAJgKACAlAACZCgAgJgAAmgoAICgAAJwKACApAACbCgAgKgAAnQoAICsAAJ4KACDzAwEAoQcAIfQDAQChBwAhhAQBAKEHACGGBEAAowcAIaIEIACpBwAhowRAAMAHACGkBEAAowcAIbwEAACKCvkEIvYEIACpBwAh9wQBAKIHACH6BAAAiwr6BCL7BCAAqQcAIQIAAACXAQAgMQAApAEAIAzzAwEAoQcAIfQDAQChBwAhhAQBAKEHACGGBEAAowcAIaIEIACpBwAhowRAAMAHACGkBEAAowcAIbwEAACKCvkEIvYEIACpBwAh9wQBAKIHACH6BAAAiwr6BCL7BCAAqQcAIQIAAACaAQAgMQAApgEAIAIAAACaAQAgMQAApgEAIAMAAACXAQAgOAAAnwEAIDkAAKQBACABAAAAlwEAIAEAAACaAQAgBQgAAIcKACA-AACJCgAgPwAAiAoAIKMEAACdBwAg9wQAAJ0HACAP8AMAANgGADDxAwAArQEAEPIDAADYBgAw8wMBAIAGACH0AwEAgAYAIYQEAQCABgAhhgRAAIIGACGiBCAAjAYAIaMEQACfBgAhpARAAIIGACG8BAAA2Qb5BCL2BCAAjAYAIfcEAQCBBgAh-gQAANoG-gQi-wQgAIwGACEDAAAAmgEAIAEAAKwBADA9AACtAQAgAwAAAJoBACABAACbAQAwAgAAlwEAIAEAAAAJACABAAAACQAgAwAAAAcAIAEAAAgAMAIAAAkAIAMAAAAHACABAAAIADACAAAJACADAAAABwAgAQAACAAwAgAACQAgCQMAAIYKACDzAwEAAAAB9wMBAAAAAYYEQAAAAAGPBAEAAAABkAQBAAAAAaQEQAAAAAHrBEAAAAAB9QQBAAAAAQExAAC1AQAgCPMDAQAAAAH3AwEAAAABhgRAAAAAAY8EAQAAAAGQBAEAAAABpARAAAAAAesEQAAAAAH1BAEAAAABATEAALcBADABMQAAtwEAMAkDAACFCgAg8wMBAKEHACH3AwEAoQcAIYYEQACjBwAhjwQBAKIHACGQBAEAogcAIaQEQACjBwAh6wRAAKMHACH1BAEAoQcAIQIAAAAJACAxAAC6AQAgCPMDAQChBwAh9wMBAKEHACGGBEAAowcAIY8EAQCiBwAhkAQBAKIHACGkBEAAowcAIesEQACjBwAh9QQBAKEHACECAAAABwAgMQAAvAEAIAIAAAAHACAxAAC8AQAgAwAAAAkAIDgAALUBACA5AAC6AQAgAQAAAAkAIAEAAAAHACAFCAAAggoAID4AAIQKACA_AACDCgAgjwQAAJ0HACCQBAAAnQcAIAvwAwAA1wYAMPEDAADDAQAQ8gMAANcGADDzAwEAgAYAIfcDAQCABgAhhgRAAIIGACGPBAEAgQYAIZAEAQCBBgAhpARAAIIGACHrBEAAggYAIfUEAQCABgAhAwAAAAcAIAEAAMIBADA9AADDAQAgAwAAAAcAIAEAAAgAMAIAAAkAIAEAAAAFACABAAAABQAgAwAAAAMAIAEAAAQAMAIAAAUAIAMAAAADACABAAAEADACAAAFACADAAAAAwAgAQAABAAwAgAABQAgDgMAAIEKACDzAwEAAAAB9wMBAAAAAYYEQAAAAAGkBEAAAAAB7AQBAAAAAe0EAQAAAAHuBAEAAAAB7wQBAAAAAfAEAQAAAAHxBEAAAAAB8gRAAAAAAfMEAQAAAAH0BAEAAAABATEAAMsBACAN8wMBAAAAAfcDAQAAAAGGBEAAAAABpARAAAAAAewEAQAAAAHtBAEAAAAB7gQBAAAAAe8EAQAAAAHwBAEAAAAB8QRAAAAAAfIEQAAAAAHzBAEAAAAB9AQBAAAAAQExAADNAQAwATEAAM0BADAOAwAAgAoAIPMDAQChBwAh9wMBAKEHACGGBEAAowcAIaQEQACjBwAh7AQBAKEHACHtBAEAoQcAIe4EAQCiBwAh7wQBAKIHACHwBAEAogcAIfEEQADABwAh8gRAAMAHACHzBAEAogcAIfQEAQCiBwAhAgAAAAUAIDEAANABACAN8wMBAKEHACH3AwEAoQcAIYYEQACjBwAhpARAAKMHACHsBAEAoQcAIe0EAQChBwAh7gQBAKIHACHvBAEAogcAIfAEAQCiBwAh8QRAAMAHACHyBEAAwAcAIfMEAQCiBwAh9AQBAKIHACECAAAAAwAgMQAA0gEAIAIAAAADACAxAADSAQAgAwAAAAUAIDgAAMsBACA5AADQAQAgAQAAAAUAIAEAAAADACAKCAAA_QkAID4AAP8JACA_AAD-CQAg7gQAAJ0HACDvBAAAnQcAIPAEAACdBwAg8QQAAJ0HACDyBAAAnQcAIPMEAACdBwAg9AQAAJ0HACAQ8AMAANYGADDxAwAA2QEAEPIDAADWBgAw8wMBAIAGACH3AwEAgAYAIYYEQACCBgAhpARAAIIGACHsBAEAgAYAIe0EAQCABgAh7gQBAIEGACHvBAEAgQYAIfAEAQCBBgAh8QRAAJ8GACHyBEAAnwYAIfMEAQCBBgAh9AQBAIEGACEDAAAAAwAgAQAA2AEAMD0AANkBACADAAAAAwAgAQAABAAwAgAABQAgCfADAADVBgAw8QMAAN8BABDyAwAA1QYAMPMDAQAAAAGGBEAAkgYAIaQEQACSBgAhswQBAJAGACHqBAEAkAYAIesEQACSBgAhAQAAANwBACABAAAA3AEAIAnwAwAA1QYAMPEDAADfAQAQ8gMAANUGADDzAwEAkAYAIYYEQACSBgAhpARAAJIGACGzBAEAkAYAIeoEAQCQBgAh6wRAAJIGACEAAwAAAN8BACABAADgAQAwAgAA3AEAIAMAAADfAQAgAQAA4AEAMAIAANwBACADAAAA3wEAIAEAAOABADACAADcAQAgBvMDAQAAAAGGBEAAAAABpARAAAAAAbMEAQAAAAHqBAEAAAAB6wRAAAAAAQExAADkAQAgBvMDAQAAAAGGBEAAAAABpARAAAAAAbMEAQAAAAHqBAEAAAAB6wRAAAAAAQExAADmAQAwATEAAOYBADAG8wMBAKEHACGGBEAAowcAIaQEQACjBwAhswQBAKEHACHqBAEAoQcAIesEQACjBwAhAgAAANwBACAxAADpAQAgBvMDAQChBwAhhgRAAKMHACGkBEAAowcAIbMEAQChBwAh6gQBAKEHACHrBEAAowcAIQIAAADfAQAgMQAA6wEAIAIAAADfAQAgMQAA6wEAIAMAAADcAQAgOAAA5AEAIDkAAOkBACABAAAA3AEAIAEAAADfAQAgAwgAAPoJACA-AAD8CQAgPwAA-wkAIAnwAwAA1AYAMPEDAADyAQAQ8gMAANQGADDzAwEAgAYAIYYEQACCBgAhpARAAIIGACGzBAEAgAYAIeoEAQCABgAh6wRAAIIGACEDAAAA3wEAIAEAAPEBADA9AADyAQAgAwAAAN8BACABAADgAQAwAgAA3AEAIAEAAABMACABAAAATAAgAwAAAEoAIAEAAEsAMAIAAEwAIAMAAABKACABAABLADACAABMACADAAAASgAgAQAASwAwAgAATAAgCwMAAPgJACAbAAD5CQAg8wMBAAAAAfcDAQAAAAGGBEAAAAABpARAAAAAAbwEAAAA5wQCvwQIAAAAAecEAQAAAAHoBAEAAAAB6QSAAAAAAQExAAD6AQAgCfMDAQAAAAH3AwEAAAABhgRAAAAAAaQEQAAAAAG8BAAAAOcEAr8ECAAAAAHnBAEAAAAB6AQBAAAAAekEgAAAAAEBMQAA_AEAMAExAAD8AQAwCwMAAO0JACAbAADuCQAg8wMBAKEHACH3AwEAoQcAIYYEQACjBwAhpARAAKMHACG8BAAA7AnnBCK_BAgAnwgAIecEAQCiBwAh6AQBAKIHACHpBIAAAAABAgAAAEwAIDEAAP8BACAJ8wMBAKEHACH3AwEAoQcAIYYEQACjBwAhpARAAKMHACG8BAAA7AnnBCK_BAgAnwgAIecEAQCiBwAh6AQBAKIHACHpBIAAAAABAgAAAEoAIDEAAIECACACAAAASgAgMQAAgQIAIAMAAABMACA4AAD6AQAgOQAA_wEAIAEAAABMACABAAAASgAgCAgAAOcJACA-AADqCQAgPwAA6QkAIJABAADoCQAgkQEAAOsJACDnBAAAnQcAIOgEAACdBwAg6QQAAJ0HACAM8AMAANAGADDxAwAAiAIAEPIDAADQBgAw8wMBAIAGACH3AwEAgAYAIYYEQACCBgAhpARAAIIGACG8BAAA0QbnBCK_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_MDAQChBwAh9AMBAKEHACH1AwEAogcAIfYDAQCiBwAhhgRAAKMHACGiBCAAqQcAIaMEQADABwAhpARAAKMHACGuBCAAqQcAIcMEAQChBwAhyAQBAKIHACECAAAA1gIAIDEAAOICACACAAAA1gIAIDEAAOICACADAAAA0wIAIDgAANsCACA5AADgAgAgAQAAANMCACABAAAA1gIAIAcIAADECAAgPgAAxggAID8AAMUIACD1AwAAnQcAIPYDAACdBwAgowQAAJ0HACDIBAAAnQcAIA7wAwAAvwYAMPEDAADpAgAQ8gMAAL8GADDzAwEAgAYAIfQDAQCABgAh9QMBAIEGACH2AwEAgQYAIYYEQACCBgAhogQgAIwGACGjBEAAnwYAIaQEQACCBgAhrgQgAIwGACHDBAEAgAYAIcgEAQCBBgAhAwAAANYCACABAADoAgAwPQAA6QIAIAMAAADWAgAgAQAA1wIAMAIAANMCACABAAAAEQAgAQAAABEAIAMAAAAPACABAAAQADACAAARACADAAAADwAgAQAAEAAwAgAAEQAgAwAAAA8AIAEAABAAMAIAABEAIAUGAADCCAAgCQAAwwgAILAEQAAAAAG0BAEAAAABxwQBAAAAAQExAADxAgAgA7AEQAAAAAG0BAEAAAABxwQBAAAAAQExAADzAgAwATEAAPMCADAFBgAAwAgAIAkAAMEIACCwBEAAowcAIbQEAQChBwAhxwQBAKEHACECAAAAEQAgMQAA9gIAIAOwBEAAowcAIbQEAQChBwAhxwQBAKEHACECAAAADwAgMQAA-AIAIAIAAAAPACAxAAD4AgAgAwAAABEAIDgAAPECACA5AAD2AgAgAQAAABEAIAEAAAAPACADCAAAvQgAID4AAL8IACA_AAC-CAAgBvADAAC-BgAw8QMAAP8CABDyAwAAvgYAMLAEQACCBgAhtAQBAIAGACHHBAEAgAYAIQMAAAAPACABAAD-AgAwPQAA_wIAIAMAAAAPACABAAAQADACAAARACALBwAAvQYAIPADAAC8BgAw8QMAAIUDABDyAwAAvAYAMPMDAQAAAAH0AwEAAAABhgRAAJIGACGiBCAAkQYAIaMEQAClBgAhpARAAJIGACHDBAEAAAABAQAAAIIDACABAAAAggMAIAsHAAC9BgAg8AMAALwGADDxAwAAhQMAEPIDAAC8BgAw8wMBAJAGACH0AwEAkAYAIYYEQACSBgAhogQgAJEGACGjBEAApQYAIaQEQACSBgAhwwQBAJAGACECBwAAvAgAIKMEAACdBwAgAwAAAIUDACABAACGAwAwAgAAggMAIAMAAACFAwAgAQAAhgMAMAIAAIIDACADAAAAhQMAIAEAAIYDADACAACCAwAgCAcAALsIACDzAwEAAAAB9AMBAAAAAYYEQAAAAAGiBCAAAAABowRAAAAAAaQEQAAAAAHDBAEAAAABATEAAIoDACAH8wMBAAAAAfQDAQAAAAGGBEAAAAABogQgAAAAAaMEQAAAAAGkBEAAAAABwwQBAAAAAQExAACMAwAwATEAAIwDADAIBwAArggAIPMDAQChBwAh9AMBAKEHACGGBEAAowcAIaIEIACpBwAhowRAAMAHACGkBEAAowcAIcMEAQChBwAhAgAAAIIDACAxAACPAwAgB_MDAQChBwAh9AMBAKEHACGGBEAAowcAIaIEIACpBwAhowRAAMAHACGkBEAAowcAIcMEAQChBwAhAgAAAIUDACAxAACRAwAgAgAAAIUDACAxAACRAwAgAwAAAIIDACA4AACKAwAgOQAAjwMAIAEAAACCAwAgAQAAAIUDACAECAAAqwgAID4AAK0IACA_AACsCAAgowQAAJ0HACAK8AMAALsGADDxAwAAmAMAEPIDAAC7BgAw8wMBAIAGACH0AwEAgAYAIYYEQACCBgAhogQgAIwGACGjBEAAnwYAIaQEQACCBgAhwwQBAIAGACEDAAAAhQMAIAEAAJcDADA9AACYAwAgAwAAAIUDACABAACGAwAwAgAAggMAIAEAAAAXACABAAAAFwAgAwAAABUAIAEAABYAMAIAABcAIAMAAAAVACABAAAWADACAAAXACADAAAAFQAgAQAAFgAwAgAAFwAgBQYAAKkIACALAACqCAAgsARAAAAAAbQEAQAAAAHCBAEAAAABATEAAKADACADsARAAAAAAbQEAQAAAAHCBAEAAAABATEAAKIDADABMQAAogMAMAUGAACnCAAgCwAAqAgAILAEQACjBwAhtAQBAKEHACHCBAEAoQcAIQIAAAAXACAxAAClAwAgA7AEQACjBwAhtAQBAKEHACHCBAEAoQcAIQIAAAAVACAxAACnAwAgAgAAABUAIDEAAKcDACADAAAAFwAgOAAAoAMAIDkAAKUDACABAAAAFwAgAQAAABUAIAMIAACkCAAgPgAApggAID8AAKUIACAG8AMAALoGADDxAwAArgMAEPIDAAC6BgAwsARAAIIGACG0BAEAgAYAIcIEAQCABgAhAwAAABUAIAEAAK0DADA9AACuAwAgAwAAABUAIAEAABYAMAIAABcAIAEAAAAtACABAAAALQAgAwAAACsAIAEAACwAMAIAAC0AIAMAAAArACABAAAsADACAAAtACADAAAAKwAgAQAALAAwAgAALQAgCAMAAKIIACAGAACjCAAg8wMBAAAAAfcDAQAAAAG0BAEAAAABvwQIAAAAAcAEAQAAAAHBBEAAAAABATEAALYDACAG8wMBAAAAAfcDAQAAAAG0BAEAAAABvwQIAAAAAcAEAQAAAAHBBEAAAAABATEAALgDADABMQAAuAMAMAgDAACgCAAgBgAAoQgAIPMDAQChBwAh9wMBAKEHACG0BAEAoQcAIb8ECACfCAAhwAQBAKEHACHBBEAAowcAIQIAAAAtACAxAAC7AwAgBvMDAQChBwAh9wMBAKEHACG0BAEAoQcAIb8ECACfCAAhwAQBAKEHACHBBEAAowcAIQIAAAArACAxAAC9AwAgAgAAACsAIDEAAL0DACADAAAALQAgOAAAtgMAIDkAALsDACABAAAALQAgAQAAACsAIAUIAACaCAAgPgAAnQgAID8AAJwIACCQAQAAmwgAIJEBAACeCAAgCfADAAC3BgAw8QMAAMQDABDyAwAAtwYAMPMDAQCABgAh9wMBAIAGACG0BAEAgAYAIb8ECAC4BgAhwAQBAIAGACHBBEAAggYAIQMAAAArACABAADDAwAwPQAAxAMAIAMAAAArACABAAAsADACAAAtACABAAAAMQAgAQAAADEAIAMAAAAvACABAAAwADACAAAxACADAAAALwAgAQAAMAAwAgAAMQAgAwAAAC8AIAEAADAAMAIAADEAIAgDAACYCAAgBgAAmQgAIPMDAQAAAAH3AwEAAAABhgRAAAAAAaIEIAAAAAGjBEAAAAABtAQBAAAAAQExAADMAwAgBvMDAQAAAAH3AwEAAAABhgRAAAAAAaIEIAAAAAGjBEAAAAABtAQBAAAAAQExAADOAwAwATEAAM4DADAIAwAAlggAIAYAAJcIACDzAwEAoQcAIfcDAQChBwAhhgRAAKMHACGiBCAAqQcAIaMEQADABwAhtAQBAKEHACECAAAAMQAgMQAA0QMAIAbzAwEAoQcAIfcDAQChBwAhhgRAAKMHACGiBCAAqQcAIaMEQADABwAhtAQBAKEHACECAAAALwAgMQAA0wMAIAIAAAAvACAxAADTAwAgAwAAADEAIDgAAMwDACA5AADRAwAgAQAAADEAIAEAAAAvACAECAAAkwgAID4AAJUIACA_AACUCAAgowQAAJ0HACAJ8AMAALYGADDxAwAA2gMAEPIDAAC2BgAw8wMBAIAGACH3AwEAgAYAIYYEQACCBgAhogQgAIwGACGjBEAAnwYAIbQEAQCABgAhAwAAAC8AIAEAANkDADA9AADaAwAgAwAAAC8AIAEAADAAMAIAADEAIAEAAAA1ACABAAAANQAgAwAAADMAIAEAADQAMAIAADUAIAMAAAAzACABAAA0ADACAAA1ACADAAAAMwAgAQAANAAwAgAANQAgBwYAAJIIACDzAwEAAAABhgRAAAAAAZgEAQAAAAGZBAEAAAABtAQBAAAAAb4EAQAAAAEBMQAA4gMAIAbzAwEAAAABhgRAAAAAAZgEAQAAAAGZBAEAAAABtAQBAAAAAb4EAQAAAAEBMQAA5AMAMAExAADkAwAwBwYAAJEIACDzAwEAoQcAIYYEQACjBwAhmAQBAKEHACGZBAEAogcAIbQEAQChBwAhvgQBAKEHACECAAAANQAgMQAA5wMAIAbzAwEAoQcAIYYEQACjBwAhmAQBAKEHACGZBAEAogcAIbQEAQChBwAhvgQBAKEHACECAAAAMwAgMQAA6QMAIAIAAAAzACAxAADpAwAgAwAAADUAIDgAAOIDACA5AADnAwAgAQAAADUAIAEAAAAzACAECAAAjggAID4AAJAIACA_AACPCAAgmQQAAJ0HACAJ8AMAALUGADDxAwAA8AMAEPIDAAC1BgAw8wMBAIAGACGGBEAAggYAIZgEAQCABgAhmQQBAIEGACG0BAEAgAYAIb4EAQCABgAhAwAAADMAIAEAAO8DADA9AADwAwAgAwAAADMAIAEAADQAMAIAADUAIAEAAAA5ACABAAAAOQAgAwAAADcAIAEAADgAMAIAADkAIAMAAAA3ACABAAA4ADACAAA5ACADAAAANwAgAQAAOAAwAgAAOQAgCgYAAIwIACAXAACNCAAg8wMBAAAAAYYEQAAAAAGiBCAAAAABowRAAAAAAbQEAQAAAAG6BAEAAAABvAQAAAC8BAK9BAEAAAABATEAAPgDACAI8wMBAAAAAYYEQAAAAAGiBCAAAAABowRAAAAAAbQEAQAAAAG6BAEAAAABvAQAAAC8BAK9BAEAAAABATEAAPoDADABMQAA-gMAMAoGAACKCAAgFwAAiwgAIPMDAQChBwAhhgRAAKMHACGiBCAAqQcAIaMEQADABwAhtAQBAKEHACG6BAEAoQcAIbwEAACJCLwEIr0EAQChBwAhAgAAADkAIDEAAP0DACAI8wMBAKEHACGGBEAAowcAIaIEIACpBwAhowRAAMAHACG0BAEAoQcAIboEAQChBwAhvAQAAIkIvAQivQQBAKEHACECAAAANwAgMQAA_wMAIAIAAAA3ACAxAAD_AwAgAwAAADkAIDgAAPgDACA5AAD9AwAgAQAAADkAIAEAAAA3ACAECAAAhggAID4AAIgIACA_AACHCAAgowQAAJ0HACAL8AMAALEGADDxAwAAhgQAEPIDAACxBgAw8wMBAIAGACGGBEAAggYAIaIEIACMBgAhowRAAJ8GACG0BAEAgAYAIboEAQCABgAhvAQAALIGvAQivQQBAIAGACEDAAAANwAgAQAAhQQAMD0AAIYEACADAAAANwAgAQAAOAAwAgAAOQAgAQAAAB0AIAEAAAAdACADAAAAGwAgAQAAHAAwAgAAHQAgAwAAABsAIAEAABwAMAIAAB0AIAMAAAAbACABAAAcADACAAAdACAOBgAAgggAIA0AAIEIACAOAACFCAAgDwAAgwgAIBEAAIQIACDzAwEAAAABhgRAAAAAAaAEAQAAAAGiBCAAAAABpARAAAAAAbQEAQAAAAG3BAEAAAABuAQBAAAAAbkEIAAAAAEBMQAAjgQAIAnzAwEAAAABhgRAAAAAAaAEAQAAAAGiBCAAAAABpARAAAAAAbQEAQAAAAG3BAEAAAABuAQBAAAAAbkEIAAAAAEBMQAAkAQAMAExAACQBAAwAQAAABsAIA4GAADlBwAgDQAA5AcAIA4AAOYHACAPAADnBwAgEQAA6AcAIPMDAQChBwAhhgRAAKMHACGgBAEAoQcAIaIEIACpBwAhpARAAKMHACG0BAEAoQcAIbcEAQChBwAhuAQBAKIHACG5BCAAqQcAIQIAAAAdACAxAACUBAAgCfMDAQChBwAhhgRAAKMHACGgBAEAoQcAIaIEIACpBwAhpARAAKMHACG0BAEAoQcAIbcEAQChBwAhuAQBAKIHACG5BCAAqQcAIQIAAAAbACAxAACWBAAgAgAAABsAIDEAAJYEACABAAAAGwAgAwAAAB0AIDgAAI4EACA5AACUBAAgAQAAAB0AIAEAAAAbACAECAAA4QcAID4AAOMHACA_AADiBwAguAQAAJ0HACAM8AMAALAGADDxAwAAngQAEPIDAACwBgAw8wMBAIAGACGGBEAAggYAIaAEAQCABgAhogQgAIwGACGkBEAAggYAIbQEAQCABgAhtwQBAIAGACG4BAEAgQYAIbkEIACMBgAhAwAAABsAIAEAAJ0EADA9AACeBAAgAwAAABsAIAEAABwAMAIAAB0AIAEAAAAjACABAAAAIwAgAwAAACEAIAEAACIAMAIAACMAIAMAAAAhACABAAAiADACAAAjACADAAAAIQAgAQAAIgAwAgAAIwAgBgMAAN8HACAQAADgBwAg9wMBAAAAAYYEQAAAAAGYBAAAALcEArUEAQAAAAEBMQAApgQAIAT3AwEAAAABhgRAAAAAAZgEAAAAtwQCtQQBAAAAAQExAACoBAAwATEAAKgEADAGAwAA3QcAIBAAAN4HACD3AwEAoQcAIYYEQACjBwAhmAQAANwHtwQitQQBAKEHACECAAAAIwAgMQAAqwQAIAT3AwEAoQcAIYYEQACjBwAhmAQAANwHtwQitQQBAKEHACECAAAAIQAgMQAArQQAIAIAAAAhACAxAACtBAAgAwAAACMAIDgAAKYEACA5AACrBAAgAQAAACMAIAEAAAAhACADCAAA2QcAID4AANsHACA_AADaBwAgB_ADAACsBgAw8QMAALQEABDyAwAArAYAMPcDAQCABgAhhgRAAIIGACGYBAAArQa3BCK1BAEAgAYAIQMAAAAhACABAACzBAAwPQAAtAQAIAMAAAAhACABAAAiADACAAAjACABAAAAKQAgAQAAACkAIAMAAAAnACABAAAoADACAAApACADAAAAJwAgAQAAKAAwAgAAKQAgAwAAACcAIAEAACgAMAIAACkAIAgDAADXBwAgBgAA2AcAIPMDAQAAAAH3AwEAAAABhgRAAAAAAaQEQAAAAAGzBAIAAAABtAQBAAAAAQExAAC8BAAgBvMDAQAAAAH3AwEAAAABhgRAAAAAAaQEQAAAAAGzBAIAAAABtAQBAAAAAQExAAC-BAAwATEAAL4EADAIAwAA1QcAIAYAANYHACDzAwEAoQcAIfcDAQChBwAhhgRAAKMHACGkBEAAowcAIbMEAgCvBwAhtAQBAKEHACECAAAAKQAgMQAAwQQAIAbzAwEAoQcAIfcDAQChBwAhhgRAAKMHACGkBEAAowcAIbMEAgCvBwAhtAQBAKEHACECAAAAJwAgMQAAwwQAIAIAAAAnACAxAADDBAAgAwAAACkAIDgAALwEACA5AADBBAAgAQAAACkAIAEAAAAnACAFCAAA0AcAID4AANMHACA_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_ADAACmBgAw8QMAAPgEABDyAwAApgYAMPMDAQCABgAh9AMBAIAGACH3AwEAgAYAIYQEAQCABgAhhgRAAIIGACGiBCAAjAYAIaMEQACfBgAhpARAAIIGACGlBAEAgQYAIaYEAQCBBgAhpwQBAIEGACGoBAEAgQYAIakEAQCBBgAhqgQCAJQGACGrBAAAmAYAIKwEIACMBgAhrQQCAJQGACGuBCAAjAYAIa8EAQCBBgAhsARAAIIGACEDAAAAbQAgAQAA9wQAMD0AAPgEACADAAAAbQAgAQAA5gQAMAIAAOMEACAO8AMAAKIGADDxAwAA_gQAEPIDAACiBgAw8wMBAAAAAYYEQACSBgAhnAQBAAAAAZ0EAQCQBgAhngQBAJAGACGfBAEAowYAIaAEAQCQBgAhoQQAAKQGACCiBCAAkQYAIaMEQAClBgAhpARAAJIGACEBAAAA-wQAIAEAAAD7BAAgDvADAACiBgAw8QMAAP4EABDyAwAAogYAMPMDAQCQBgAhhgRAAJIGACGcBAEAkAYAIZ0EAQCQBgAhngQBAJAGACGfBAEAowYAIaAEAQCQBgAhoQQAAKQGACCiBCAAkQYAIaMEQAClBgAhpARAAJIGACEDnwQAAJ0HACChBAAAnQcAIKMEAACdBwAgAwAAAP4EACABAAD_BAAwAgAA-wQAIAMAAAD-BAAgAQAA_wQAMAIAAPsEACADAAAA_gQAIAEAAP8EADACAAD7BAAgC_MDAQChBwAhhgRAAKMHACGcBAEAoQcAIZ0EAQChBwAhngQBAKEHACGfBAEAogcAIaAEAQChBwAhoQSAAAAAAaIEIACpBwAhowRAAMAHACGkBEAAowcAIQIAAAD7BAAgMQAAgwUAIAvzAwEAoQcAIYYEQACjBwAhnAQBAKEHACGdBAEAoQcAIZ4EAQChBwAhnwQBAKIHACGgBAEAoQcAIaEEgAAAAAGiBCAAqQcAIaMEQADABwAhpARAAKMHACECAAAA_gQAIDEAAIUFACACAAAA_gQAIDEAAIUFACABAAAA-wQAIAEAAAD-BAAgBggAAL0HACA-AAC_BwAgPwAAvgcAIJ8EAACdBwAgoQQAAJ0HACCjBAAAnQcAIA7wAwAAngYAMPEDAACLBQAQ8gMAAJ4GADDzAwEAgAYAIYYEQACCBgAhnAQBAIAGACGdBAEAgAYAIZ4EAQCABgAhnwQBAIEGACGgBAEAgAYAIaEEAACYBgAgogQgAIwGACGjBEAAnwYAIaQEQACCBgAhAwAAAP4EACABAACKBQAwPQAAiwUAIAMAAAD-BAAgAQAA_wQAMAIAAPsEACABAAAASAAgAQAAAEgAIAMAAABGACABAABHADACAABIACADAAAARgAgAQAARwAwAgAASAAgAwAAAEYAIAEAAEcAMAIAAEgAIAkDAAC8BwAgMYAAAAAB8wMBAAAAAfcDAQAAAAGGBEAAAAABmAQAAACYBAKZBAEAAAABmgQBAAAAAZsEIAAAAAEBMQAAkwUAIAgxgAAAAAHzAwEAAAAB9wMBAAAAAYYEQAAAAAGYBAAAAJgEApkEAQAAAAGaBAEAAAABmwQgAAAAAQExAACVBQAwATEAAJUFADAJAwAAuwcAIDGAAAAAAfMDAQChBwAh9wMBAKEHACGGBEAAowcAIZgEAAC6B5gEIpkEAQChBwAhmgQBAKEHACGbBCAAqQcAIQIAAABIACAxAACYBQAgCDGAAAAAAfMDAQChBwAh9wMBAKEHACGGBEAAowcAIZgEAAC6B5gEIpkEAQChBwAhmgQBAKEHACGbBCAAqQcAIQIAAABGACAxAACaBQAgAgAAAEYAIDEAAJoFACADAAAASAAgOAAAkwUAIDkAAJgFACABAAAASAAgAQAAAEYAIAQIAAC3BwAgMQAAnQcAID4AALkHACA_AAC4BwAgCzEAAJgGACDwAwAAmgYAMPEDAAChBQAQ8gMAAJoGADDzAwEAgAYAIfcDAQCABgAhhgRAAIIGACGYBAAAmwaYBCKZBAEAgAYAIZoEAQCABgAhmwQgAIwGACEDAAAARgAgAQAAoAUAMD0AAKEFACADAAAARgAgAQAARwAwAgAASAAgAQAAAFsAIAEAAABbACADAAAAWQAgAQAAWgAwAgAAWwAgAwAAAFkAIAEAAFoAMAIAAFsAIAMAAABZACABAABaADACAABbACALIAAAtgcAIPMDAQAAAAGGBEAAAAABiQQBAAAAAYoEAQAAAAGLBAEAAAABjAQBAAAAAY0EgAAAAAGOBIAAAAABjwQBAAAAAZAEAQAAAAEBMQAAqQUAIArzAwEAAAABhgRAAAAAAYkEAQAAAAGKBAEAAAABiwQBAAAAAYwEAQAAAAGNBIAAAAABjgSAAAAAAY8EAQAAAAGQBAEAAAABATEAAKsFADABMQAAqwUAMAsgAAC1BwAg8wMBAKEHACGGBEAAowcAIYkEAQChBwAhigQBAKEHACGLBAEAoQcAIYwEAQChBwAhjQSAAAAAAY4EgAAAAAGPBAEAogcAIZAEAQCiBwAhAgAAAFsAIDEAAK4FACAK8wMBAKEHACGGBEAAowcAIYkEAQChBwAhigQBAKEHACGLBAEAoQcAIYwEAQChBwAhjQSAAAAAAY4EgAAAAAGPBAEAogcAIZAEAQCiBwAhAgAAAFkAIDEAALAFACACAAAAWQAgMQAAsAUAIAMAAABbACA4AACpBQAgOQAArgUAIAEAAABbACABAAAAWQAgBwgAALIHACA-AAC0BwAgPwAAswcAII0EAACdBwAgjgQAAJ0HACCPBAAAnQcAIJAEAACdBwAgDfADAACXBgAw8QMAALcFABDyAwAAlwYAMPMDAQCABgAhhgRAAIIGACGJBAEAgAYAIYoEAQCABgAhiwQBAIAGACGMBAEAgAYAIY0EAACYBgAgjgQAAJgGACCPBAEAgQYAIZAEAQCBBgAhAwAAAFkAIAEAALYFADA9AAC3BQAgAwAAAFkAIAEAAFoAMAIAAFsAIAEAAABfACABAAAAXwAgAwAAAF0AIAEAAF4AMAIAAF8AIAMAAABdACABAABeADACAABfACADAAAAXQAgAQAAXgAwAgAAXwAgBgMAALEHACDzAwEAAAAB9wMBAAAAAYYEQAAAAAGHBAEAAAABiAQCAAAAAQExAAC_BQAgBfMDAQAAAAH3AwEAAAABhgRAAAAAAYcEAQAAAAGIBAIAAAABATEAAMEFADABMQAAwQUAMAYDAACwBwAg8wMBAKEHACH3AwEAoQcAIYYEQACjBwAhhwQBAKEHACGIBAIArwcAIQIAAABfACAxAADEBQAgBfMDAQChBwAh9wMBAKEHACGGBEAAowcAIYcEAQChBwAhiAQCAK8HACECAAAAXQAgMQAAxgUAIAIAAABdACAxAADGBQAgAwAAAF8AIDgAAL8FACA5AADEBQAgAQAAAF8AIAEAAABdACAFCAAAqgcAID4AAK0HACA_AACsBwAgkAEAAKsHACCRAQAArgcAIAjwAwAAkwYAMPEDAADNBQAQ8gMAAJMGADDzAwEAgAYAIfcDAQCABgAhhgRAAIIGACGHBAEAgAYAIYgEAgCUBgAhAwAAAF0AIAEAAMwFADA9AADNBQAgAwAAAF0AIAEAAF4AMAIAAF8AIAfwAwAAjwYAMPEDAADTBQAQ8gMAAI8GADDzAwEAAAABhAQBAAAAAYUEIACRBgAhhgRAAJIGACEBAAAA0AUAIAEAAADQBQAgB_ADAACPBgAw8QMAANMFABDyAwAAjwYAMPMDAQCQBgAhhAQBAJAGACGFBCAAkQYAIYYEQACSBgAhAAMAAADTBQAgAQAA1AUAMAIAANAFACADAAAA0wUAIAEAANQFADACAADQBQAgAwAAANMFACABAADUBQAwAgAA0AUAIATzAwEAAAABhAQBAAAAAYUEIAAAAAGGBEAAAAABATEAANgFACAE8wMBAAAAAYQEAQAAAAGFBCAAAAABhgRAAAAAAQExAADaBQAwATEAANoFADAE8wMBAKEHACGEBAEAoQcAIYUEIACpBwAhhgRAAKMHACECAAAA0AUAIDEAAN0FACAE8wMBAKEHACGEBAEAoQcAIYUEIACpBwAhhgRAAKMHACECAAAA0wUAIDEAAN8FACACAAAA0wUAIDEAAN8FACADAAAA0AUAIDgAANgFACA5AADdBQAgAQAAANAFACABAAAA0wUAIAMIAACmBwAgPgAAqAcAID8AAKcHACAH8AMAAIsGADDxAwAA5gUAEPIDAACLBgAw8wMBAIAGACGEBAEAgAYAIYUEIACMBgAhhgRAAIIGACEDAAAA0wUAIAEAAOUFADA9AADmBQAgAwAAANMFACABAADUBQAwAgAA0AUAIAEAAABlACABAAAAZQAgAwAAAGMAIAEAAGQAMAIAAGUAIAMAAABjACABAABkADACAABlACADAAAAYwAgAQAAZAAwAgAAZQAgBwMAAKUHACDzAwEAAAAB9AMBAAAAAfUDAQAAAAH2AwEAAAAB9wMBAAAAAfgDQAAAAAEBMQAA7gUAIAbzAwEAAAAB9AMBAAAAAfUDAQAAAAH2AwEAAAAB9wMBAAAAAfgDQAAAAAEBMQAA8AUAMAExAADwBQAwBwMAAKQHACDzAwEAoQcAIfQDAQChBwAh9QMBAKEHACH2AwEAogcAIfcDAQChBwAh-ANAAKMHACECAAAAZQAgMQAA8wUAIAbzAwEAoQcAIfQDAQChBwAh9QMBAKEHACH2AwEAogcAIfcDAQChBwAh-ANAAKMHACECAAAAYwAgMQAA9QUAIAIAAABjACAxAAD1BQAgAwAAAGUAIDgAAO4FACA5AADzBQAgAQAAAGUAIAEAAABjACAECAAAngcAID4AAKAHACA_AACfBwAg9gMAAJ0HACAJ8AMAAP8FADDxAwAA_AUAEPIDAAD_BQAw8wMBAIAGACH0AwEAgAYAIfUDAQCABgAh9gMBAIEGACH3AwEAgAYAIfgDQACCBgAhAwAAAGMAIAEAAPsFADA9AAD8BQAgAwAAAGMAIAEAAGQAMAIAAGUAIAnwAwAA_wUAMPEDAAD8BQAQ8gMAAP8FADDzAwEAgAYAIfQDAQCABgAh9QMBAIAGACH2AwEAgQYAIfcDAQCABgAh-ANAAIIGACEOCAAAhAYAID4AAIoGACA_AACKBgAg-QMBAAAAAfoDAQAAAAT7AwEAAAAE_AMBAAAAAf0DAQAAAAH-AwEAAAAB_wMBAAAAAYAEAQCJBgAhgQQBAAAAAYIEAQAAAAGDBAEAAAABDggAAIcGACA-AACIBgAgPwAAiAYAIPkDAQAAAAH6AwEAAAAF-wMBAAAABfwDAQAAAAH9AwEAAAAB_gMBAAAAAf8DAQAAAAGABAEAhgYAIYEEAQAAAAGCBAEAAAABgwQBAAAAAQsIAACEBgAgPgAAhQYAID8AAIUGACD5A0AAAAAB-gNAAAAABPsDQAAAAAT8A0AAAAAB_QNAAAAAAf4DQAAAAAH_A0AAAAABgARAAIMGACELCAAAhAYAID4AAIUGACA_AACFBgAg-QNAAAAAAfoDQAAAAAT7A0AAAAAE_ANAAAAAAf0DQAAAAAH-A0AAAAAB_wNAAAAAAYAEQACDBgAhCPkDAgAAAAH6AwIAAAAE-wMCAAAABPwDAgAAAAH9AwIAAAAB_gMCAAAAAf8DAgAAAAGABAIAhAYAIQj5A0AAAAAB-gNAAAAABPsDQAAAAAT8A0AAAAAB_QNAAAAAAf4DQAAAAAH_A0AAAAABgARAAIUGACEOCAAAhwYAID4AAIgGACA_AACIBgAg-QMBAAAAAfoDAQAAAAX7AwEAAAAF_AMBAAAAAf0DAQAAAAH-AwEAAAAB_wMBAAAAAYAEAQCGBgAhgQQBAAAAAYIEAQAAAAGDBAEAAAABCPkDAgAAAAH6AwIAAAAF-wMCAAAABfwDAgAAAAH9AwIAAAAB_gMCAAAAAf8DAgAAAAGABAIAhwYAIQv5AwEAAAAB-gMBAAAABfsDAQAAAAX8AwEAAAAB_QMBAAAAAf4DAQAAAAH_AwEAAAABgAQBAIgGACGBBAEAAAABggQBAAAAAYMEAQAAAAEOCAAAhAYAID4AAIoGACA_AACKBgAg-QMBAAAAAfoDAQAAAAT7AwEAAAAE_AMBAAAAAf0DAQAAAAH-AwEAAAAB_wMBAAAAAYAEAQCJBgAhgQQBAAAAAYIEAQAAAAGDBAEAAAABC_kDAQAAAAH6AwEAAAAE-wMBAAAABPwDAQAAAAH9AwEAAAAB_gMBAAAAAf8DAQAAAAGABAEAigYAIYEEAQAAAAGCBAEAAAABgwQBAAAAAQfwAwAAiwYAMPEDAADmBQAQ8gMAAIsGADDzAwEAgAYAIYQEAQCABgAhhQQgAIwGACGGBEAAggYAIQUIAACEBgAgPgAAjgYAID8AAI4GACD5AyAAAAABgAQgAI0GACEFCAAAhAYAID4AAI4GACA_AACOBgAg-QMgAAAAAYAEIACNBgAhAvkDIAAAAAGABCAAjgYAIQfwAwAAjwYAMPEDAADTBQAQ8gMAAI8GADDzAwEAkAYAIYQEAQCQBgAhhQQgAJEGACGGBEAAkgYAIQv5AwEAAAAB-gMBAAAABPsDAQAAAAT8AwEAAAAB_QMBAAAAAf4DAQAAAAH_AwEAAAABgAQBAIoGACGBBAEAAAABggQBAAAAAYMEAQAAAAEC-QMgAAAAAYAEIACOBgAhCPkDQAAAAAH6A0AAAAAE-wNAAAAABPwDQAAAAAH9A0AAAAAB_gNAAAAAAf8DQAAAAAGABEAAhQYAIQjwAwAAkwYAMPEDAADNBQAQ8gMAAJMGADDzAwEAgAYAIfcDAQCABgAhhgRAAIIGACGHBAEAgAYAIYgEAgCUBgAhDQgAAIQGACA-AACEBgAgPwAAhAYAIJABAACWBgAgkQEAAIQGACD5AwIAAAAB-gMCAAAABPsDAgAAAAT8AwIAAAAB_QMCAAAAAf4DAgAAAAH_AwIAAAABgAQCAJUGACENCAAAhAYAID4AAIQGACA_AACEBgAgkAEAAJYGACCRAQAAhAYAIPkDAgAAAAH6AwIAAAAE-wMCAAAABPwDAgAAAAH9AwIAAAAB_gMCAAAAAf8DAgAAAAGABAIAlQYAIQj5AwgAAAAB-gMIAAAABPsDCAAAAAT8AwgAAAAB_QMIAAAAAf4DCAAAAAH_AwgAAAABgAQIAJYGACEN8AMAAJcGADDxAwAAtwUAEPIDAACXBgAw8wMBAIAGACGGBEAAggYAIYkEAQCABgAhigQBAIAGACGLBAEAgAYAIYwEAQCABgAhjQQAAJgGACCOBAAAmAYAII8EAQCBBgAhkAQBAIEGACEPCAAAhwYAID4AAJkGACA_AACZBgAg-QOAAAAAAfwDgAAAAAH9A4AAAAAB_gOAAAAAAf8DgAAAAAGABIAAAAABkQQBAAAAAZIEAQAAAAGTBAEAAAABlASAAAAAAZUEgAAAAAGWBIAAAAABDPkDgAAAAAH8A4AAAAAB_QOAAAAAAf4DgAAAAAH_A4AAAAABgASAAAAAAZEEAQAAAAGSBAEAAAABkwQBAAAAAZQEgAAAAAGVBIAAAAABlgSAAAAAAQsxAACYBgAg8AMAAJoGADDxAwAAoQUAEPIDAACaBgAw8wMBAIAGACH3AwEAgAYAIYYEQACCBgAhmAQAAJsGmAQimQQBAIAGACGaBAEAgAYAIZsEIACMBgAhBwgAAIQGACA-AACdBgAgPwAAnQYAIPkDAAAAmAQC-gMAAACYBAj7AwAAAJgECIAEAACcBpgEIgcIAACEBgAgPgAAnQYAID8AAJ0GACD5AwAAAJgEAvoDAAAAmAQI-wMAAACYBAiABAAAnAaYBCIE-QMAAACYBAL6AwAAAJgECPsDAAAAmAQIgAQAAJ0GmAQiDvADAACeBgAw8QMAAIsFABDyAwAAngYAMPMDAQCABgAhhgRAAIIGACGcBAEAgAYAIZ0EAQCABgAhngQBAIAGACGfBAEAgQYAIaAEAQCABgAhoQQAAJgGACCiBCAAjAYAIaMEQACfBgAhpARAAIIGACELCAAAhwYAID4AAKEGACA_AAChBgAg-QNAAAAAAfoDQAAAAAX7A0AAAAAF_ANAAAAAAf0DQAAAAAH-A0AAAAAB_wNAAAAAAYAEQACgBgAhCwgAAIcGACA-AAChBgAgPwAAoQYAIPkDQAAAAAH6A0AAAAAF-wNAAAAABfwDQAAAAAH9A0AAAAAB_gNAAAAAAf8DQAAAAAGABEAAoAYAIQj5A0AAAAAB-gNAAAAABfsDQAAAAAX8A0AAAAAB_QNAAAAAAf4DQAAAAAH_A0AAAAABgARAAKEGACEO8AMAAKIGADDxAwAA_gQAEPIDAACiBgAw8wMBAJAGACGGBEAAkgYAIZwEAQCQBgAhnQQBAJAGACGeBAEAkAYAIZ8EAQCjBgAhoAQBAJAGACGhBAAApAYAIKIEIACRBgAhowRAAKUGACGkBEAAkgYAIQv5AwEAAAAB-gMBAAAABfsDAQAAAAX8AwEAAAAB_QMBAAAAAf4DAQAAAAH_AwEAAAABgAQBAIgGACGBBAEAAAABggQBAAAAAYMEAQAAAAEM-QOAAAAAAfwDgAAAAAH9A4AAAAAB_gOAAAAAAf8DgAAAAAGABIAAAAABkQQBAAAAAZIEAQAAAAGTBAEAAAABlASAAAAAAZUEgAAAAAGWBIAAAAABCPkDQAAAAAH6A0AAAAAF-wNAAAAABfwDQAAAAAH9A0AAAAAB_gNAAAAAAf8DQAAAAAGABEAAoQYAIRfwAwAApgYAMPEDAAD4BAAQ8gMAAKYGADDzAwEAgAYAIfQDAQCABgAh9wMBAIAGACGEBAEAgAYAIYYEQACCBgAhogQgAIwGACGjBEAAnwYAIaQEQACCBgAhpQQBAIEGACGmBAEAgQYAIacEAQCBBgAhqAQBAIEGACGpBAEAgQYAIaoEAgCUBgAhqwQAAJgGACCsBCAAjAYAIa0EAgCUBgAhrgQgAIwGACGvBAEAgQYAIbAEQACCBgAhGAMAAKkGACDwAwAApwYAMPEDAABtABDyAwAApwYAMPMDAQCQBgAh9AMBAJAGACH3AwEAkAYAIYQEAQCQBgAhhgRAAJIGACGiBCAAkQYAIaMEQAClBgAhpARAAJIGACGlBAEAowYAIaYEAQCjBgAhpwQBAKMGACGoBAEAowYAIakEAQCjBgAhqgQCAKgGACGrBAAApAYAIKwEIACRBgAhrQQCAKgGACGuBCAAkQYAIa8EAQCjBgAhsARAAJIGACEI-QMCAAAAAfoDAgAAAAT7AwIAAAAE_AMCAAAAAf0DAgAAAAH-AwIAAAAB_wMCAAAAAYAEAgCEBgAhJAQAAOIGACAFAADjBgAgBwAA5AYAIBIAAOUGACATAADmBgAgGQAA5wYAIBoAAOgGACAeAADpBgAgHwAA6gYAICEAAOsGACAiAADsBgAgIwAA7QYAICQAAO4GACAlAADvBgAgJgAA8AYAICgAAPEGACApAADxBgAgKgAA8gYAICsAAPMGACDwAwAA3wYAMPEDAACaAQAQ8gMAAN8GADDzAwEAkAYAIfQDAQCQBgAhhAQBAJAGACGGBEAAkgYAIaIEIACRBgAhowRAAKUGACGkBEAAkgYAIbwEAADgBvkEIvYEIACRBgAh9wQBAKMGACH6BAAA4Qb6BCL7BCAAkQYAIYEFAACaAQAgggUAAJoBACAG8AMAAKoGADDxAwAA4AQAEPIDAACqBgAwhgRAAIIGACGxBAEAgAYAIbIEAQCABgAhCfADAACrBgAw8QMAAMoEABDyAwAAqwYAMPMDAQCABgAh9wMBAIAGACGGBEAAggYAIaQEQACCBgAhswQCAJQGACG0BAEAgAYAIQfwAwAArAYAMPEDAAC0BAAQ8gMAAKwGADD3AwEAgAYAIYYEQACCBgAhmAQAAK0GtwQitQQBAIAGACEHCAAAhAYAID4AAK8GACA_AACvBgAg-QMAAAC3BAL6AwAAALcECPsDAAAAtwQIgAQAAK4GtwQiBwgAAIQGACA-AACvBgAgPwAArwYAIPkDAAAAtwQC-gMAAAC3BAj7AwAAALcECIAEAACuBrcEIgT5AwAAALcEAvoDAAAAtwQI-wMAAAC3BAiABAAArwa3BCIM8AMAALAGADDxAwAAngQAEPIDAACwBgAw8wMBAIAGACGGBEAAggYAIaAEAQCABgAhogQgAIwGACGkBEAAggYAIbQEAQCABgAhtwQBAIAGACG4BAEAgQYAIbkEIACMBgAhC_ADAACxBgAw8QMAAIYEABDyAwAAsQYAMPMDAQCABgAhhgRAAIIGACGiBCAAjAYAIaMEQACfBgAhtAQBAIAGACG6BAEAgAYAIbwEAACyBrwEIr0EAQCABgAhBwgAAIQGACA-AAC0BgAgPwAAtAYAIPkDAAAAvAQC-gMAAAC8BAj7AwAAALwECIAEAACzBrwEIgcIAACEBgAgPgAAtAYAID8AALQGACD5AwAAALwEAvoDAAAAvAQI-wMAAAC8BAiABAAAswa8BCIE-QMAAAC8BAL6AwAAALwECPsDAAAAvAQIgAQAALQGvAQiCfADAAC1BgAw8QMAAPADABDyAwAAtQYAMPMDAQCABgAhhgRAAIIGACGYBAEAgAYAIZkEAQCBBgAhtAQBAIAGACG-BAEAgAYAIQnwAwAAtgYAMPEDAADaAwAQ8gMAALYGADDzAwEAgAYAIfcDAQCABgAhhgRAAIIGACGiBCAAjAYAIaMEQACfBgAhtAQBAIAGACEJ8AMAALcGADDxAwAAxAMAEPIDAAC3BgAw8wMBAIAGACH3AwEAgAYAIbQEAQCABgAhvwQIALgGACHABAEAgAYAIcEEQACCBgAhDQgAAIQGACA-AACWBgAgPwAAlgYAIJABAACWBgAgkQEAAJYGACD5AwgAAAAB-gMIAAAABPsDCAAAAAT8AwgAAAAB_QMIAAAAAf4DCAAAAAH_AwgAAAABgAQIALkGACENCAAAhAYAID4AAJYGACA_AACWBgAgkAEAAJYGACCRAQAAlgYAIPkDCAAAAAH6AwgAAAAE-wMIAAAABPwDCAAAAAH9AwgAAAAB_gMIAAAAAf8DCAAAAAGABAgAuQYAIQbwAwAAugYAMPEDAACuAwAQ8gMAALoGADCwBEAAggYAIbQEAQCABgAhwgQBAIAGACEK8AMAALsGADDxAwAAmAMAEPIDAAC7BgAw8wMBAIAGACH0AwEAgAYAIYYEQACCBgAhogQgAIwGACGjBEAAnwYAIaQEQACCBgAhwwQBAIAGACELBwAAvQYAIPADAAC8BgAw8QMAAIUDABDyAwAAvAYAMPMDAQCQBgAh9AMBAJAGACGGBEAAkgYAIaIEIACRBgAhowRAAKUGACGkBEAAkgYAIcMEAQCQBgAhA8QEAAAVACDFBAAAFQAgxgQAABUAIAbwAwAAvgYAMPEDAAD_AgAQ8gMAAL4GADCwBEAAggYAIbQEAQCABgAhxwQBAIAGACEO8AMAAL8GADDxAwAA6QIAEPIDAAC_BgAw8wMBAIAGACH0AwEAgAYAIfUDAQCBBgAh9gMBAIEGACGGBEAAggYAIaIEIACMBgAhowRAAJ8GACGkBEAAggYAIa4EIACMBgAhwwQBAIAGACHIBAEAgQYAIQ8HAADBBgAg8AMAAMAGADDxAwAA1gIAEPIDAADABgAw8wMBAJAGACH0AwEAkAYAIfUDAQCjBgAh9gMBAKMGACGGBEAAkgYAIaIEIACRBgAhowRAAKUGACGkBEAAkgYAIa4EIACRBgAhwwQBAJAGACHIBAEAowYAIQPEBAAADwAgxQQAAA8AIMYEAAAPACAc8AMAAMIGADDxAwAA0AIAEPIDAADCBgAw8wMBAIAGACH1AwEAgAYAIYYEQACCBgAhmQQBAIAGACGiBCAAjAYAIaMEQACfBgAhpARAAIIGACG3BAEAgAYAIbwEAACyBrwEIsMEAQCBBgAhyQQBAIAGACHKBAEAgAYAIcsEAADDBgAgzAQBAIEGACHNBAEAgQYAIc4EQACfBgAhzwQgAIwGACHQBAgAxAYAIdEEIACMBgAh0gRAAJ8GACHTBAIAlAYAIdQEAgCUBgAh1QQCAJQGACHWBAgAuAYAIdcEQACfBgAhBPkDAQAAAAXYBAEAAAAB2QQBAAAABNoEAQAAAAQNCAAAhwYAID4AAMYGACA_AADGBgAgkAEAAMYGACCRAQAAxgYAIPkDCAAAAAH6AwgAAAAF-wMIAAAABfwDCAAAAAH9AwgAAAAB_gMIAAAAAf8DCAAAAAGABAgAxQYAIQ0IAACHBgAgPgAAxgYAID8AAMYGACCQAQAAxgYAIJEBAADGBgAg-QMIAAAAAfoDCAAAAAX7AwgAAAAF_AMIAAAAAf0DCAAAAAH-AwgAAAAB_wMIAAAAAYAECADFBgAhCPkDCAAAAAH6AwgAAAAF-wMIAAAABfwDCAAAAAH9AwgAAAAB_gMIAAAAAf8DCAAAAAGABAgAxgYAIQ7wAwAAxwYAMPEDAAC6AgAQ8gMAAMcGADDzAwEAgAYAIfcDAQCABgAhhgRAAIIGACGkBEAAggYAIa4EIACMBgAhwAQBAIEGACHcBAAAyAbcBCLdBEAAggYAId4EQACfBgAh3wQgAIwGACHgBAEAgQYAIQcIAACEBgAgPgAAygYAID8AAMoGACD5AwAAANwEAvoDAAAA3AQI-wMAAADcBAiABAAAyQbcBCIHCAAAhAYAID4AAMoGACA_AADKBgAg-QMAAADcBAL6AwAAANwECPsDAAAA3AQIgAQAAMkG3AQiBPkDAAAA3AQC-gMAAADcBAj7AwAAANwECIAEAADKBtwEIhDwAwAAywYAMPEDAACgAgAQ8gMAAMsGADDzAwEAgAYAIfQDAQCABgAh9QMBAIEGACGGBEAAggYAIaQEQACCBgAhrgQgAIwGACHQBAgAuAYAIdwEAADIBtwEIuEEAgCUBgAh4gQAAMMGACDjBAIAlAYAIeQEIACMBgAh5QQBAIEGACERGwAAzwYAIPADAADMBgAw8QMAAFIAEPIDAADMBgAw8wMBAJAGACH0AwEAkAYAIfUDAQCjBgAhhgRAAJIGACGkBEAAkgYAIa4EIACRBgAh0AQIAM4GACHcBAAAzQbcBCLhBAIAqAYAIeIEAADDBgAg4wQCAKgGACHkBCAAkQYAIeUEAQCjBgAhBPkDAAAA3AQC-gMAAADcBAj7AwAAANwECIAEAADKBtwEIgj5AwgAAAAB-gMIAAAABPsDCAAAAAT8AwgAAAAB_QMIAAAAAf4DCAAAAAH_AwgAAAABgAQIAJYGACEDxAQAAE4AIMUEAABOACDGBAAATgAgDPADAADQBgAw8QMAAIgCABDyAwAA0AYAMPMDAQCABgAh9wMBAIAGACGGBEAAggYAIaQEQACCBgAhvAQAANEG5wQivwQIALgGACHnBAEAgQYAIegEAQCBBgAh6QQAAJgGACAHCAAAhAYAID4AANMGACA_AADTBgAg-QMAAADnBAL6AwAAAOcECPsDAAAA5wQIgAQAANIG5wQiBwgAAIQGACA-AADTBgAgPwAA0wYAIPkDAAAA5wQC-gMAAADnBAj7AwAAAOcECIAEAADSBucEIgT5AwAAAOcEAvoDAAAA5wQI-wMAAADnBAiABAAA0wbnBCIJ8AMAANQGADDxAwAA8gEAEPIDAADUBgAw8wMBAIAGACGGBEAAggYAIaQEQACCBgAhswQBAIAGACHqBAEAgAYAIesEQACCBgAhCfADAADVBgAw8QMAAN8BABDyAwAA1QYAMPMDAQCQBgAhhgRAAJIGACGkBEAAkgYAIbMEAQCQBgAh6gQBAJAGACHrBEAAkgYAIRDwAwAA1gYAMPEDAADZAQAQ8gMAANYGADDzAwEAgAYAIfcDAQCABgAhhgRAAIIGACGkBEAAggYAIewEAQCABgAh7QQBAIAGACHuBAEAgQYAIe8EAQCBBgAh8AQBAIEGACHxBEAAnwYAIfIEQACfBgAh8wQBAIEGACH0BAEAgQYAIQvwAwAA1wYAMPEDAADDAQAQ8gMAANcGADDzAwEAgAYAIfcDAQCABgAhhgRAAIIGACGPBAEAgQYAIZAEAQCBBgAhpARAAIIGACHrBEAAggYAIfUEAQCABgAhD_ADAADYBgAw8QMAAK0BABDyAwAA2AYAMPMDAQCABgAh9AMBAIAGACGEBAEAgAYAIYYEQACCBgAhogQgAIwGACGjBEAAnwYAIaQEQACCBgAhvAQAANkG-QQi9gQgAIwGACH3BAEAgQYAIfoEAADaBvoEIvsEIACMBgAhBwgAAIQGACA-AADeBgAgPwAA3gYAIPkDAAAA-QQC-gMAAAD5BAj7AwAAAPkECIAEAADdBvkEIgcIAACEBgAgPgAA3AYAID8AANwGACD5AwAAAPoEAvoDAAAA-gQI-wMAAAD6BAiABAAA2wb6BCIHCAAAhAYAID4AANwGACA_AADcBgAg-QMAAAD6BAL6AwAAAPoECPsDAAAA-gQIgAQAANsG-gQiBPkDAAAA-gQC-gMAAAD6BAj7AwAAAPoECIAEAADcBvoEIgcIAACEBgAgPgAA3gYAID8AAN4GACD5AwAAAPkEAvoDAAAA-QQI-wMAAAD5BAiABAAA3Qb5BCIE-QMAAAD5BAL6AwAAAPkECPsDAAAA-QQIgAQAAN4G-QQiIgQAAOIGACAFAADjBgAgBwAA5AYAIBIAAOUGACATAADmBgAgGQAA5wYAIBoAAOgGACAeAADpBgAgHwAA6gYAICEAAOsGACAiAADsBgAgIwAA7QYAICQAAO4GACAlAADvBgAgJgAA8AYAICgAAPEGACApAADxBgAgKgAA8gYAICsAAPMGACDwAwAA3wYAMPEDAACaAQAQ8gMAAN8GADDzAwEAkAYAIfQDAQCQBgAhhAQBAJAGACGGBEAAkgYAIaIEIACRBgAhowRAAKUGACGkBEAAkgYAIbwEAADgBvkEIvYEIACRBgAh9wQBAKMGACH6BAAA4Qb6BCL7BCAAkQYAIQT5AwAAAPkEAvoDAAAA-QQI-wMAAAD5BAiABAAA3gb5BCIE-QMAAAD6BAL6AwAAAPoECPsDAAAA-gQIgAQAANwG-gQiA8QEAAADACDFBAAAAwAgxgQAAAMAIAPEBAAABwAgxQQAAAcAIMYEAAAHACADxAQAAAsAIMUEAAALACDGBAAACwAgA8QEAAAbACDFBAAAGwAgxgQAABsAIAPEBAAAJwAgxQQAACcAIMYEAAAnACADxAQAACEAIMUEAAAhACDGBAAAIQAgA8QEAABGACDFBAAARgAgxgQAAEYAIAPEBAAASgAgxQQAAEoAIMYEAABKACATAwAAqQYAIBwAAPwGACAdAAD9BgAg8AMAAPsGADDxAwAATgAQ8gMAAPsGADDzAwEAkAYAIfcDAQCQBgAhhgRAAJIGACGkBEAAkgYAIa4EIACRBgAhwAQBAKMGACHcBAAAzQbcBCLdBEAAkgYAId4EQAClBgAh3wQgAJEGACHgBAEAowYAIYEFAABOACCCBQAATgAgA8QEAABZACDFBAAAWQAgxgQAAFkAIAPEBAAAXQAgxQQAAF0AIMYEAABdACADxAQAACsAIMUEAAArACDGBAAAKwAgA8QEAAAvACDFBAAALwAgxgQAAC8AIAPEBAAAYwAgxQQAAGMAIMYEAABjACADxAQAADcAIMUEAAA3ACDGBAAANwAgA8QEAABoACDFBAAAaAAgxgQAAGgAIBoDAACpBgAg8AMAAKcGADDxAwAAbQAQ8gMAAKcGADDzAwEAkAYAIfQDAQCQBgAh9wMBAJAGACGEBAEAkAYAIYYEQACSBgAhogQgAJEGACGjBEAApQYAIaQEQACSBgAhpQQBAKMGACGmBAEAowYAIacEAQCjBgAhqAQBAKMGACGpBAEAowYAIaoEAgCoBgAhqwQAAKQGACCsBCAAkQYAIa0EAgCoBgAhrgQgAJEGACGvBAEAowYAIbAEQACSBgAhgQUAAG0AIIIFAABtACAQAwAAqQYAIPADAAD1BgAw8QMAAG8AEPIDAAD1BgAw8wMBAJAGACH0AwEAkAYAIfcDAQCQBgAhhAQBAJAGACGGBEAAkgYAIaIEIACRBgAhowRAAKUGACGkBEAAkgYAIaUEAQCjBgAhpgQBAKMGACGBBQAAbwAgggUAAG8AIA3wAwAA9AYAMPEDAACUAQAQ8gMAAPQGADDzAwEAgAYAIfQDAQCABgAh9wMBAIAGACGEBAEAgAYAIYYEQACCBgAhogQgAIwGACGjBEAAnwYAIaQEQACCBgAhpQQBAIEGACGmBAEAgQYAIQ4DAACpBgAg8AMAAPUGADDxAwAAbwAQ8gMAAPUGADDzAwEAkAYAIfQDAQCQBgAh9wMBAJAGACGEBAEAkAYAIYYEQACSBgAhogQgAJEGACGjBEAApQYAIaQEQACSBgAhpQQBAKMGACGmBAEAowYAIQKxBAEAAAABsgQBAAAAAQgnAACpBgAgKAAAqQYAIPADAAD3BgAw8QMAAGgAEPIDAAD3BgAwhgRAAJIGACGxBAEAkAYAIbIEAQCQBgAhCgMAAKkGACDwAwAA-AYAMPEDAABjABDyAwAA-AYAMPMDAQCQBgAh9AMBAJAGACH1AwEAkAYAIfYDAQCjBgAh9wMBAJAGACH4A0AAkgYAIQkDAACpBgAg8AMAAPkGADDxAwAAXQAQ8gMAAPkGADDzAwEAkAYAIfcDAQCQBgAhhgRAAJIGACGHBAEAkAYAIYgEAgCoBgAhDiAAAKkGACDwAwAA-gYAMPEDAABZABDyAwAA-gYAMPMDAQCQBgAhhgRAAJIGACGJBAEAkAYAIYoEAQCQBgAhiwQBAJAGACGMBAEAkAYAIY0EAACkBgAgjgQAAKQGACCPBAEAowYAIZAEAQCjBgAhEQMAAKkGACAcAAD8BgAgHQAA_QYAIPADAAD7BgAw8QMAAE4AEPIDAAD7BgAw8wMBAJAGACH3AwEAkAYAIYYEQACSBgAhpARAAJIGACGuBCAAkQYAIcAEAQCjBgAh3AQAAM0G3AQi3QRAAJIGACHeBEAApQYAId8EIACRBgAh4AQBAKMGACETGwAAzwYAIPADAADMBgAw8QMAAFIAEPIDAADMBgAw8wMBAJAGACH0AwEAkAYAIfUDAQCjBgAhhgRAAJIGACGkBEAAkgYAIa4EIACRBgAh0AQIAM4GACHcBAAAzQbcBCLhBAIAqAYAIeIEAADDBgAg4wQCAKgGACHkBCAAkQYAIeUEAQCjBgAhgQUAAFIAIIIFAABSACAQAwAAqQYAIBsAAM8GACDwAwAA_gYAMPEDAABKABDyAwAA_gYAMPMDAQCQBgAh9wMBAJAGACGGBEAAkgYAIaQEQACSBgAhvAQAAP8G5wQivwQIAM4GACHnBAEAowYAIegEAQCjBgAh6QQAAKQGACCBBQAASgAgggUAAEoAIA4DAACpBgAgGwAAzwYAIPADAAD-BgAw8QMAAEoAEPIDAAD-BgAw8wMBAJAGACH3AwEAkAYAIYYEQACSBgAhpARAAJIGACG8BAAA_wbnBCK_BAgAzgYAIecEAQCjBgAh6AQBAKMGACHpBAAApAYAIAT5AwAAAOcEAvoDAAAA5wQI-wMAAADnBAiABAAA0wbnBCIMAwAAqQYAIDEAAKQGACDwAwAAgAcAMPEDAABGABDyAwAAgAcAMPMDAQCQBgAh9wMBAJAGACGGBEAAkgYAIZgEAACBB5gEIpkEAQCQBgAhmgQBAJAGACGbBCAAkQYAIQT5AwAAAJgEAvoDAAAAmAQI-wMAAACYBAiABAAAnQaYBCINBgAAhAcAIBcAAKkGACDwAwAAggcAMPEDAAA3ABDyAwAAggcAMPMDAQCQBgAhhgRAAJIGACGiBCAAkQYAIaMEQAClBgAhtAQBAJAGACG6BAEAkAYAIbwEAACDB7wEIr0EAQCQBgAhBPkDAAAAvAQC-gMAAAC8BAj7AwAAALwECIAEAAC0BrwEIicKAADBBgAgDAAAvQYAIA0AAKkGACASAADlBgAgEwAA5gYAIBQAAO0GACAVAADuBgAgFgAAmgcAIBgAAPAGACDwAwAAmAcAMPEDAAALABDyAwAAmAcAMPMDAQCQBgAh9QMBAJAGACGGBEAAkgYAIZkEAQCQBgAhogQgAJEGACGjBEAApQYAIaQEQACSBgAhtwQBAJAGACG8BAAAgwe8BCLDBAEAowYAIckEAQCQBgAhygQBAJAGACHLBAAAwwYAIMwEAQCjBgAhzQQBAKMGACHOBEAApQYAIc8EIACRBgAh0AQIAJkHACHRBCAAkQYAIdIEQAClBgAh0wQCAKgGACHUBAIAqAYAIdUEAgCoBgAh1gQIAM4GACHXBEAApQYAIYEFAAALACCCBQAACwAgCgYAAIQHACDwAwAAhQcAMPEDAAAzABDyAwAAhQcAMPMDAQCQBgAhhgRAAJIGACGYBAEAkAYAIZkEAQCjBgAhtAQBAJAGACG-BAEAkAYAIQL3AwEAAAABtAQBAAAAAQsDAACpBgAgBgAAhAcAIPADAACHBwAw8QMAAC8AEPIDAACHBwAw8wMBAJAGACH3AwEAkAYAIYYEQACSBgAhogQgAJEGACGjBEAApQYAIbQEAQCQBgAhAvcDAQAAAAG0BAEAAAABCwMAAKkGACAGAACEBwAg8AMAAIkHADDxAwAAKwAQ8gMAAIkHADDzAwEAkAYAIfcDAQCQBgAhtAQBAJAGACG_BAgAzgYAIcAEAQCQBgAhwQRAAJIGACEC9wMBAAAAAbQEAQAAAAELAwAAqQYAIAYAAIQHACDwAwAAiwcAMPEDAAAnABDyAwAAiwcAMPMDAQCQBgAh9wMBAJAGACGGBEAAkgYAIaQEQACSBgAhswQCAKgGACG0BAEAkAYAIQL3AwEAAAABtQQBAAAAAQkDAACpBgAgEAAAjwcAIPADAACNBwAw8QMAACEAEPIDAACNBwAw9wMBAJAGACGGBEAAkgYAIZgEAACOB7cEIrUEAQCQBgAhBPkDAAAAtwQC-gMAAAC3BAj7AwAAALcECIAEAACvBrcEIhMGAACEBwAgDQAAqQYAIA4AAJEHACAPAADlBgAgEQAA5wYAIPADAACQBwAw8QMAABsAEPIDAACQBwAw8wMBAJAGACGGBEAAkgYAIaAEAQCQBgAhogQgAJEGACGkBEAAkgYAIbQEAQCQBgAhtwQBAJAGACG4BAEAowYAIbkEIACRBgAhgQUAABsAIIIFAAAbACARBgAAhAcAIA0AAKkGACAOAACRBwAgDwAA5QYAIBEAAOcGACDwAwAAkAcAMPEDAAAbABDyAwAAkAcAMPMDAQCQBgAhhgRAAJIGACGgBAEAkAYAIaIEIACRBgAhpARAAJIGACG0BAEAkAYAIbcEAQCQBgAhuAQBAKMGACG5BCAAkQYAIRMGAACEBwAgDQAAqQYAIA4AAJEHACAPAADlBgAgEQAA5wYAIPADAACQBwAw8QMAABsAEPIDAACQBwAw8wMBAJAGACGGBEAAkgYAIaAEAQCQBgAhogQgAJEGACGkBEAAkgYAIbQEAQCQBgAhtwQBAJAGACG4BAEAowYAIbkEIACRBgAhgQUAABsAIIIFAAAbACACtAQBAAAAAcIEAQAAAAEIBgAAhAcAIAsAAJQHACDwAwAAkwcAMPEDAAAVABDyAwAAkwcAMLAEQACSBgAhtAQBAJAGACHCBAEAkAYAIQ0HAAC9BgAg8AMAALwGADDxAwAAhQMAEPIDAAC8BgAw8wMBAJAGACH0AwEAkAYAIYYEQACSBgAhogQgAJEGACGjBEAApQYAIaQEQACSBgAhwwQBAJAGACGBBQAAhQMAIIIFAACFAwAgArQEAQAAAAHHBAEAAAABCAYAAIQHACAJAACXBwAg8AMAAJYHADDxAwAADwAQ8gMAAJYHADCwBEAAkgYAIbQEAQCQBgAhxwQBAJAGACERBwAAwQYAIPADAADABgAw8QMAANYCABDyAwAAwAYAMPMDAQCQBgAh9AMBAJAGACH1AwEAowYAIfYDAQCjBgAhhgRAAJIGACGiBCAAkQYAIaMEQAClBgAhpARAAJIGACGuBCAAkQYAIcMEAQCQBgAhyAQBAKMGACGBBQAA1gIAIIIFAADWAgAgJQoAAMEGACAMAAC9BgAgDQAAqQYAIBIAAOUGACATAADmBgAgFAAA7QYAIBUAAO4GACAWAACaBwAgGAAA8AYAIPADAACYBwAw8QMAAAsAEPIDAACYBwAw8wMBAJAGACH1AwEAkAYAIYYEQACSBgAhmQQBAJAGACGiBCAAkQYAIaMEQAClBgAhpARAAJIGACG3BAEAkAYAIbwEAACDB7wEIsMEAQCjBgAhyQQBAJAGACHKBAEAkAYAIcsEAADDBgAgzAQBAKMGACHNBAEAowYAIc4EQAClBgAhzwQgAJEGACHQBAgAmQcAIdEEIACRBgAh0gRAAKUGACHTBAIAqAYAIdQEAgCoBgAh1QQCAKgGACHWBAgAzgYAIdcEQAClBgAhCPkDCAAAAAH6AwgAAAAF-wMIAAAABfwDCAAAAAH9AwgAAAAB_gMIAAAAAf8DCAAAAAGABAgAxgYAIQPEBAAAMwAgxQQAADMAIMYEAAAzACAMAwAAqQYAIPADAACbBwAw8QMAAAcAEPIDAACbBwAw8wMBAJAGACH3AwEAkAYAIYYEQACSBgAhjwQBAKMGACGQBAEAowYAIaQEQACSBgAh6wRAAJIGACH1BAEAkAYAIREDAACpBgAg8AMAAJwHADDxAwAAAwAQ8gMAAJwHADDzAwEAkAYAIfcDAQCQBgAhhgRAAJIGACGkBEAAkgYAIewEAQCQBgAh7QQBAJAGACHuBAEAowYAIe8EAQCjBgAh8AQBAKMGACHxBEAApQYAIfIEQAClBgAh8wQBAKMGACH0BAEAowYAIQAAAAABhgUBAAAAAQGGBQEAAAABAYYFQAAAAAEFOAAAyA0AIDkAAMsNACCDBQAAyQ0AIIQFAADKDQAgiQUAAJcBACADOAAAyA0AIIMFAADJDQAgiQUAAJcBACAAAAABhgUgAAAAAQAAAAAABYYFAgAAAAGNBQIAAAABjgUCAAAAAY8FAgAAAAGQBQIAAAABBTgAAMMNACA5AADGDQAggwUAAMQNACCEBQAAxQ0AIIkFAACXAQAgAzgAAMMNACCDBQAAxA0AIIkFAACXAQAgAAAABTgAAL4NACA5AADBDQAggwUAAL8NACCEBQAAwA0AIIkFAACXAQAgAzgAAL4NACCDBQAAvw0AIIkFAACXAQAgAAAAAYYFAAAAmAQCBTgAALkNACA5AAC8DQAggwUAALoNACCEBQAAuw0AIIkFAACXAQAgAzgAALkNACCDBQAAug0AIIkFAACXAQAgAAAAAYYFQAAAAAEAAAAAAAU4AAC0DQAgOQAAtw0AIIMFAAC1DQAghAUAALYNACCJBQAAlwEAIAM4AAC0DQAggwUAALUNACCJBQAAlwEAIBUEAADsCwAgBQAA7QsAIAcAAO4LACASAADvCwAgEwAA8AsAIBkAAPELACAaAADyCwAgHgAA8wsAIB8AAPQLACAhAAD1CwAgIgAA9gsAICMAAPcLACAkAAD4CwAgJQAA-QsAICYAAPoLACAoAAD7CwAgKQAA-wsAICoAAPwLACArAAD9CwAgowQAAJ0HACD3BAAAnQcAIAAAAAU4AACsDQAgOQAAsg0AIIMFAACtDQAghAUAALENACCJBQAAlwEAIAU4AACqDQAgOQAArw0AIIMFAACrDQAghAUAAK4NACCJBQAAlwEAIAM4AACsDQAggwUAAK0NACCJBQAAlwEAIAM4AACqDQAggwUAAKsNACCJBQAAlwEAIAAAAAAABTgAAKINACA5AACoDQAggwUAAKMNACCEBQAApw0AIIkFAACXAQAgBTgAAKANACA5AAClDQAggwUAAKENACCEBQAApA0AIIkFAAANACADOAAAog0AIIMFAACjDQAgiQUAAJcBACADOAAAoA0AIIMFAAChDQAgiQUAAA0AIAAAAAGGBQAAALcEAgU4AACYDQAgOQAAng0AIIMFAACZDQAghAUAAJ0NACCJBQAAlwEAIAU4AACWDQAgOQAAmw0AIIMFAACXDQAghAUAAJoNACCJBQAAHQAgAzgAAJgNACCDBQAAmQ0AIIkFAACXAQAgAzgAAJYNACCDBQAAlw0AIIkFAAAdACAAAAAFOAAAiQ0AIDkAAJQNACCDBQAAig0AIIQFAACTDQAgiQUAAJcBACAFOAAAhw0AIDkAAJENACCDBQAAiA0AIIQFAACQDQAgiQUAAA0AIAc4AACFDQAgOQAAjg0AIIMFAACGDQAghAUAAI0NACCHBQAAGwAgiAUAABsAIIkFAAAdACALOAAA9QcAMDkAAPoHADCDBQAA9gcAMIQFAAD3BwAwhQUAAPgHACCGBQAA-QcAMIcFAAD5BwAwiAUAAPkHADCJBQAA-QcAMIoFAAD7BwAwiwUAAPwHADALOAAA6QcAMDkAAO4HADCDBQAA6gcAMIQFAADrBwAwhQUAAOwHACCGBQAA7QcAMIcFAADtBwAwiAUAAO0HADCJBQAA7QcAMIoFAADvBwAwiwUAAPAHADAEAwAA3wcAIPcDAQAAAAGGBEAAAAABmAQAAAC3BAICAAAAIwAgOAAA9AcAIAMAAAAjACA4AAD0BwAgOQAA8wcAIAExAACMDQAwCgMAAKkGACAQAACPBwAg8AMAAI0HADDxAwAAIQAQ8gMAAI0HADD3AwEAkAYAIYYEQACSBgAhmAQAAI4HtwQitQQBAJAGACH-BAAAjAcAIAIAAAAjACAxAADzBwAgAgAAAPEHACAxAADyBwAgB_ADAADwBwAw8QMAAPEHABDyAwAA8AcAMPcDAQCQBgAhhgRAAJIGACGYBAAAjge3BCK1BAEAkAYAIQfwAwAA8AcAMPEDAADxBwAQ8gMAAPAHADD3AwEAkAYAIYYEQACSBgAhmAQAAI4HtwQitQQBAJAGACED9wMBAKEHACGGBEAAowcAIZgEAADcB7cEIgQDAADdBwAg9wMBAKEHACGGBEAAowcAIZgEAADcB7cEIgQDAADfBwAg9wMBAAAAAYYEQAAAAAGYBAAAALcEAgwGAACCCAAgDQAAgQgAIA8AAIMIACARAACECAAg8wMBAAAAAYYEQAAAAAGgBAEAAAABogQgAAAAAaQEQAAAAAG0BAEAAAABtwQBAAAAAbkEIAAAAAECAAAAHQAgOAAAgAgAIAMAAAAdACA4AACACAAgOQAA_wcAIAExAACLDQAwEQYAAIQHACANAACpBgAgDgAAkQcAIA8AAOUGACARAADnBgAg8AMAAJAHADDxAwAAGwAQ8gMAAJAHADDzAwEAAAABhgRAAJIGACGgBAEAkAYAIaIEIACRBgAhpARAAJIGACG0BAEAkAYAIbcEAQCQBgAhuAQBAKMGACG5BCAAkQYAIQIAAAAdACAxAAD_BwAgAgAAAP0HACAxAAD-BwAgDPADAAD8BwAw8QMAAP0HABDyAwAA_AcAMPMDAQCQBgAhhgRAAJIGACGgBAEAkAYAIaIEIACRBgAhpARAAJIGACG0BAEAkAYAIbcEAQCQBgAhuAQBAKMGACG5BCAAkQYAIQzwAwAA_AcAMPEDAAD9BwAQ8gMAAPwHADDzAwEAkAYAIYYEQACSBgAhoAQBAJAGACGiBCAAkQYAIaQEQACSBgAhtAQBAJAGACG3BAEAkAYAIbgEAQCjBgAhuQQgAJEGACEI8wMBAKEHACGGBEAAowcAIaAEAQChBwAhogQgAKkHACGkBEAAowcAIbQEAQChBwAhtwQBAKEHACG5BCAAqQcAIQwGAADlBwAgDQAA5AcAIA8AAOcHACARAADoBwAg8wMBAKEHACGGBEAAowcAIaAEAQChBwAhogQgAKkHACGkBEAAowcAIbQEAQChBwAhtwQBAKEHACG5BCAAqQcAIQwGAACCCAAgDQAAgQgAIA8AAIMIACARAACECAAg8wMBAAAAAYYEQAAAAAGgBAEAAAABogQgAAAAAaQEQAAAAAG0BAEAAAABtwQBAAAAAbkEIAAAAAEDOAAAiQ0AIIMFAACKDQAgiQUAAJcBACADOAAAhw0AIIMFAACIDQAgiQUAAA0AIAQ4AAD1BwAwgwUAAPYHADCFBQAA-AcAIIkFAAD5BwAwBDgAAOkHADCDBQAA6gcAMIUFAADsBwAgiQUAAO0HADADOAAAhQ0AIIMFAACGDQAgiQUAAB0AIAAAAAGGBQAAALwEAgU4AAD9DAAgOQAAgw0AIIMFAAD-DAAghAUAAIINACCJBQAADQAgBTgAAPsMACA5AACADQAggwUAAPwMACCEBQAA_wwAIIkFAACXAQAgAzgAAP0MACCDBQAA_gwAIIkFAAANACADOAAA-wwAIIMFAAD8DAAgiQUAAJcBACAAAAAFOAAA9gwAIDkAAPkMACCDBQAA9wwAIIQFAAD4DAAgiQUAAA0AIAM4AAD2DAAggwUAAPcMACCJBQAADQAgAAAABTgAAO4MACA5AAD0DAAggwUAAO8MACCEBQAA8wwAIIkFAACXAQAgBTgAAOwMACA5AADxDAAggwUAAO0MACCEBQAA8AwAIIkFAAANACADOAAA7gwAIIMFAADvDAAgiQUAAJcBACADOAAA7AwAIIMFAADtDAAgiQUAAA0AIAAAAAAABYYFCAAAAAGNBQgAAAABjgUIAAAAAY8FCAAAAAGQBQgAAAABBTgAAOQMACA5AADqDAAggwUAAOUMACCEBQAA6QwAIIkFAACXAQAgBTgAAOIMACA5AADnDAAggwUAAOMMACCEBQAA5gwAIIkFAAANACADOAAA5AwAIIMFAADlDAAgiQUAAJcBACADOAAA4gwAIIMFAADjDAAgiQUAAA0AIAAAAAU4AADaDAAgOQAA4AwAIIMFAADbDAAghAUAAN8MACCJBQAADQAgBTgAANgMACA5AADdDAAggwUAANkMACCEBQAA3AwAIIkFAACCAwAgAzgAANoMACCDBQAA2wwAIIkFAAANACADOAAA2AwAIIMFAADZDAAgiQUAAIIDACAAAAALOAAArwgAMDkAALQIADCDBQAAsAgAMIQFAACxCAAwhQUAALIIACCGBQAAswgAMIcFAACzCAAwiAUAALMIADCJBQAAswgAMIoFAAC1CAAwiwUAALYIADADBgAAqQgAILAEQAAAAAG0BAEAAAABAgAAABcAIDgAALoIACADAAAAFwAgOAAAuggAIDkAALkIACABMQAA1wwAMAkGAACEBwAgCwAAlAcAIPADAACTBwAw8QMAABUAEPIDAACTBwAwsARAAJIGACG0BAEAkAYAIcIEAQCQBgAh_wQAAJIHACACAAAAFwAgMQAAuQgAIAIAAAC3CAAgMQAAuAgAIAbwAwAAtggAMPEDAAC3CAAQ8gMAALYIADCwBEAAkgYAIbQEAQCQBgAhwgQBAJAGACEG8AMAALYIADDxAwAAtwgAEPIDAAC2CAAwsARAAJIGACG0BAEAkAYAIcIEAQCQBgAhArAEQACjBwAhtAQBAKEHACEDBgAApwgAILAEQACjBwAhtAQBAKEHACEDBgAAqQgAILAEQAAAAAG0BAEAAAABBDgAAK8IADCDBQAAsAgAMIUFAACyCAAgiQUAALMIADAAAAAABTgAAM8MACA5AADVDAAggwUAANAMACCEBQAA1AwAIIkFAAANACAFOAAAzQwAIDkAANIMACCDBQAAzgwAIIQFAADRDAAgiQUAANMCACADOAAAzwwAIIMFAADQDAAgiQUAAA0AIAM4AADNDAAggwUAAM4MACCJBQAA0wIAIAAAAAs4AADICAAwOQAAzQgAMIMFAADJCAAwhAUAAMoIADCFBQAAywgAIIYFAADMCAAwhwUAAMwIADCIBQAAzAgAMIkFAADMCAAwigUAAM4IADCLBQAAzwgAMAMGAADCCAAgsARAAAAAAbQEAQAAAAECAAAAEQAgOAAA0wgAIAMAAAARACA4AADTCAAgOQAA0ggAIAExAADMDAAwCQYAAIQHACAJAACXBwAg8AMAAJYHADDxAwAADwAQ8gMAAJYHADCwBEAAkgYAIbQEAQCQBgAhxwQBAJAGACGABQAAlQcAIAIAAAARACAxAADSCAAgAgAAANAIACAxAADRCAAgBvADAADPCAAw8QMAANAIABDyAwAAzwgAMLAEQACSBgAhtAQBAJAGACHHBAEAkAYAIQbwAwAAzwgAMPEDAADQCAAQ8gMAAM8IADCwBEAAkgYAIbQEAQCQBgAhxwQBAJAGACECsARAAKMHACG0BAEAoQcAIQMGAADACAAgsARAAKMHACG0BAEAoQcAIQMGAADCCAAgsARAAAAAAbQEAQAAAAEEOAAAyAgAMIMFAADJCAAwhQUAAMsIACCJBQAAzAgAMAAAAAAAAAKGBQEAAAAEjAUBAAAABQWGBQgAAAABjQUIAAAAAY4FCAAAAAGPBQgAAAABkAUIAAAAAQs4AAC0CQAwOQAAuAkAMIMFAAC1CQAwhAUAALYJADCFBQAAtwkAIIYFAADMCAAwhwUAAMwIADCIBQAAzAgAMIkFAADMCAAwigUAALkJADCLBQAAzwgAMAs4AACrCQAwOQAArwkAMIMFAACsCQAwhAUAAK0JADCFBQAArgkAIIYFAACzCAAwhwUAALMIADCIBQAAswgAMIkFAACzCAAwigUAALAJADCLBQAAtggAMAU4AAC_DAAgOQAAygwAIIMFAADADAAghAUAAMkMACCJBQAAlwEAIAs4AACiCQAwOQAApgkAMIMFAACjCQAwhAUAAKQJADCFBQAApQkAIIYFAAD5BwAwhwUAAPkHADCIBQAA-QcAMIkFAAD5BwAwigUAAKcJADCLBQAA_AcAMAs4AACWCQAwOQAAmwkAMIMFAACXCQAwhAUAAJgJADCFBQAAmQkAIIYFAACaCQAwhwUAAJoJADCIBQAAmgkAMIkFAACaCQAwigUAAJwJADCLBQAAnQkAMAs4AACKCQAwOQAAjwkAMIMFAACLCQAwhAUAAIwJADCFBQAAjQkAIIYFAACOCQAwhwUAAI4JADCIBQAAjgkAMIkFAACOCQAwigUAAJAJADCLBQAAkQkAMAs4AAD-CAAwOQAAgwkAMIMFAAD_CAAwhAUAAIAJADCFBQAAgQkAIIYFAACCCQAwhwUAAIIJADCIBQAAggkAMIkFAACCCQAwigUAAIQJADCLBQAAhQkAMAs4AADyCAAwOQAA9wgAMIMFAADzCAAwhAUAAPQIADCFBQAA9QgAIIYFAAD2CAAwhwUAAPYIADCIBQAA9ggAMIkFAAD2CAAwigUAAPgIADCLBQAA-QgAMAs4AADmCAAwOQAA6wgAMIMFAADnCAAwhAUAAOgIADCFBQAA6QgAIIYFAADqCAAwhwUAAOoIADCIBQAA6ggAMIkFAADqCAAwigUAAOwIADCLBQAA7QgAMAgXAACNCAAg8wMBAAAAAYYEQAAAAAGiBCAAAAABowRAAAAAAboEAQAAAAG8BAAAALwEAr0EAQAAAAECAAAAOQAgOAAA8QgAIAMAAAA5ACA4AADxCAAgOQAA8AgAIAExAADIDAAwDQYAAIQHACAXAACpBgAg8AMAAIIHADDxAwAANwAQ8gMAAIIHADDzAwEAAAABhgRAAJIGACGiBCAAkQYAIaMEQAClBgAhtAQBAJAGACG6BAEAkAYAIbwEAACDB7wEIr0EAQCQBgAhAgAAADkAIDEAAPAIACACAAAA7ggAIDEAAO8IACAL8AMAAO0IADDxAwAA7ggAEPIDAADtCAAw8wMBAJAGACGGBEAAkgYAIaIEIACRBgAhowRAAKUGACG0BAEAkAYAIboEAQCQBgAhvAQAAIMHvAQivQQBAJAGACEL8AMAAO0IADDxAwAA7ggAEPIDAADtCAAw8wMBAJAGACGGBEAAkgYAIaIEIACRBgAhowRAAKUGACG0BAEAkAYAIboEAQCQBgAhvAQAAIMHvAQivQQBAJAGACEH8wMBAKEHACGGBEAAowcAIaIEIACpBwAhowRAAMAHACG6BAEAoQcAIbwEAACJCLwEIr0EAQChBwAhCBcAAIsIACDzAwEAoQcAIYYEQACjBwAhogQgAKkHACGjBEAAwAcAIboEAQChBwAhvAQAAIkIvAQivQQBAKEHACEIFwAAjQgAIPMDAQAAAAGGBEAAAAABogQgAAAAAaMEQAAAAAG6BAEAAAABvAQAAAC8BAK9BAEAAAABBfMDAQAAAAGGBEAAAAABmAQBAAAAAZkEAQAAAAG-BAEAAAABAgAAADUAIDgAAP0IACADAAAANQAgOAAA_QgAIDkAAPwIACABMQAAxwwAMAoGAACEBwAg8AMAAIUHADDxAwAAMwAQ8gMAAIUHADDzAwEAAAABhgRAAJIGACGYBAEAkAYAIZkEAQCjBgAhtAQBAJAGACG-BAEAkAYAIQIAAAA1ACAxAAD8CAAgAgAAAPoIACAxAAD7CAAgCfADAAD5CAAw8QMAAPoIABDyAwAA-QgAMPMDAQCQBgAhhgRAAJIGACGYBAEAkAYAIZkEAQCjBgAhtAQBAJAGACG-BAEAkAYAIQnwAwAA-QgAMPEDAAD6CAAQ8gMAAPkIADDzAwEAkAYAIYYEQACSBgAhmAQBAJAGACGZBAEAowYAIbQEAQCQBgAhvgQBAJAGACEF8wMBAKEHACGGBEAAowcAIZgEAQChBwAhmQQBAKIHACG-BAEAoQcAIQXzAwEAoQcAIYYEQACjBwAhmAQBAKEHACGZBAEAogcAIb4EAQChBwAhBfMDAQAAAAGGBEAAAAABmAQBAAAAAZkEAQAAAAG-BAEAAAABBgMAAJgIACDzAwEAAAAB9wMBAAAAAYYEQAAAAAGiBCAAAAABowRAAAAAAQIAAAAxACA4AACJCQAgAwAAADEAIDgAAIkJACA5AACICQAgATEAAMYMADAMAwAAqQYAIAYAAIQHACDwAwAAhwcAMPEDAAAvABDyAwAAhwcAMPMDAQAAAAH3AwEAkAYAIYYEQACSBgAhogQgAJEGACGjBEAApQYAIbQEAQCQBgAh_QQAAIYHACACAAAAMQAgMQAAiAkAIAIAAACGCQAgMQAAhwkAIAnwAwAAhQkAMPEDAACGCQAQ8gMAAIUJADDzAwEAkAYAIfcDAQCQBgAhhgRAAJIGACGiBCAAkQYAIaMEQAClBgAhtAQBAJAGACEJ8AMAAIUJADDxAwAAhgkAEPIDAACFCQAw8wMBAJAGACH3AwEAkAYAIYYEQACSBgAhogQgAJEGACGjBEAApQYAIbQEAQCQBgAhBfMDAQChBwAh9wMBAKEHACGGBEAAowcAIaIEIACpBwAhowRAAMAHACEGAwAAlggAIPMDAQChBwAh9wMBAKEHACGGBEAAowcAIaIEIACpBwAhowRAAMAHACEGAwAAmAgAIPMDAQAAAAH3AwEAAAABhgRAAAAAAaIEIAAAAAGjBEAAAAABBgMAAKIIACDzAwEAAAAB9wMBAAAAAb8ECAAAAAHABAEAAAABwQRAAAAAAQIAAAAtACA4AACVCQAgAwAAAC0AIDgAAJUJACA5AACUCQAgATEAAMUMADAMAwAAqQYAIAYAAIQHACDwAwAAiQcAMPEDAAArABDyAwAAiQcAMPMDAQAAAAH3AwEAkAYAIbQEAQCQBgAhvwQIAM4GACHABAEAkAYAIcEEQACSBgAh_QQAAIgHACACAAAALQAgMQAAlAkAIAIAAACSCQAgMQAAkwkAIAnwAwAAkQkAMPEDAACSCQAQ8gMAAJEJADDzAwEAkAYAIfcDAQCQBgAhtAQBAJAGACG_BAgAzgYAIcAEAQCQBgAhwQRAAJIGACEJ8AMAAJEJADDxAwAAkgkAEPIDAACRCQAw8wMBAJAGACH3AwEAkAYAIbQEAQCQBgAhvwQIAM4GACHABAEAkAYAIcEEQACSBgAhBfMDAQChBwAh9wMBAKEHACG_BAgAnwgAIcAEAQChBwAhwQRAAKMHACEGAwAAoAgAIPMDAQChBwAh9wMBAKEHACG_BAgAnwgAIcAEAQChBwAhwQRAAKMHACEGAwAAoggAIPMDAQAAAAH3AwEAAAABvwQIAAAAAcAEAQAAAAHBBEAAAAABBgMAANcHACDzAwEAAAAB9wMBAAAAAYYEQAAAAAGkBEAAAAABswQCAAAAAQIAAAApACA4AAChCQAgAwAAACkAIDgAAKEJACA5AACgCQAgATEAAMQMADAMAwAAqQYAIAYAAIQHACDwAwAAiwcAMPEDAAAnABDyAwAAiwcAMPMDAQAAAAH3AwEAkAYAIYYEQACSBgAhpARAAJIGACGzBAIAqAYAIbQEAQCQBgAh_QQAAIoHACACAAAAKQAgMQAAoAkAIAIAAACeCQAgMQAAnwkAIAnwAwAAnQkAMPEDAACeCQAQ8gMAAJ0JADDzAwEAkAYAIfcDAQCQBgAhhgRAAJIGACGkBEAAkgYAIbMEAgCoBgAhtAQBAJAGACEJ8AMAAJ0JADDxAwAAngkAEPIDAACdCQAw8wMBAJAGACH3AwEAkAYAIYYEQACSBgAhpARAAJIGACGzBAIAqAYAIbQEAQCQBgAhBfMDAQChBwAh9wMBAKEHACGGBEAAowcAIaQEQACjBwAhswQCAK8HACEGAwAA1QcAIPMDAQChBwAh9wMBAKEHACGGBEAAowcAIaQEQACjBwAhswQCAK8HACEGAwAA1wcAIPMDAQAAAAH3AwEAAAABhgRAAAAAAaQEQAAAAAGzBAIAAAABDA0AAIEIACAOAACFCAAgDwAAgwgAIBEAAIQIACDzAwEAAAABhgRAAAAAAaAEAQAAAAGiBCAAAAABpARAAAAAAbcEAQAAAAG4BAEAAAABuQQgAAAAAQIAAAAdACA4AACqCQAgAwAAAB0AIDgAAKoJACA5AACpCQAgATEAAMMMADACAAAAHQAgMQAAqQkAIAIAAAD9BwAgMQAAqAkAIAjzAwEAoQcAIYYEQACjBwAhoAQBAKEHACGiBCAAqQcAIaQEQACjBwAhtwQBAKEHACG4BAEAogcAIbkEIACpBwAhDA0AAOQHACAOAADmBwAgDwAA5wcAIBEAAOgHACDzAwEAoQcAIYYEQACjBwAhoAQBAKEHACGiBCAAqQcAIaQEQACjBwAhtwQBAKEHACG4BAEAogcAIbkEIACpBwAhDA0AAIEIACAOAACFCAAgDwAAgwgAIBEAAIQIACDzAwEAAAABhgRAAAAAAaAEAQAAAAGiBCAAAAABpARAAAAAAbcEAQAAAAG4BAEAAAABuQQgAAAAAQMLAACqCAAgsARAAAAAAcIEAQAAAAECAAAAFwAgOAAAswkAIAMAAAAXACA4AACzCQAgOQAAsgkAIAExAADCDAAwAgAAABcAIDEAALIJACACAAAAtwgAIDEAALEJACACsARAAKMHACHCBAEAoQcAIQMLAACoCAAgsARAAKMHACHCBAEAoQcAIQMLAACqCAAgsARAAAAAAcIEAQAAAAEDCQAAwwgAILAEQAAAAAHHBAEAAAABAgAAABEAIDgAALwJACADAAAAEQAgOAAAvAkAIDkAALsJACABMQAAwQwAMAIAAAARACAxAAC7CQAgAgAAANAIACAxAAC6CQAgArAEQACjBwAhxwQBAKEHACEDCQAAwQgAILAEQACjBwAhxwQBAKEHACEDCQAAwwgAILAEQAAAAAHHBAEAAAABAYYFAQAAAAQEOAAAtAkAMIMFAAC1CQAwhQUAALcJACCJBQAAzAgAMAQ4AACrCQAwgwUAAKwJADCFBQAArgkAIIkFAACzCAAwAzgAAL8MACCDBQAAwAwAIIkFAACXAQAgBDgAAKIJADCDBQAAowkAMIUFAAClCQAgiQUAAPkHADAEOAAAlgkAMIMFAACXCQAwhQUAAJkJACCJBQAAmgkAMAQ4AACKCQAwgwUAAIsJADCFBQAAjQkAIIkFAACOCQAwBDgAAP4IADCDBQAA_wgAMIUFAACBCQAgiQUAAIIJADAEOAAA8ggAMIMFAADzCAAwhQUAAPUIACCJBQAA9ggAMAQ4AADmCAAwgwUAAOcIADCFBQAA6QgAIIkFAADqCAAwAAAAAYYFAAAA3AQCBTgAALQMACA5AAC9DAAggwUAALUMACCEBQAAvAwAIIkFAACXAQAgBzgAALIMACA5AAC6DAAggwUAALMMACCEBQAAuQwAIIcFAABSACCIBQAAUgAgiQUAAIsCACAHOAAAsAwAIDkAALcMACCDBQAAsQwAIIQFAAC2DAAghwUAAEoAIIgFAABKACCJBQAATAAgAzgAALQMACCDBQAAtQwAIIkFAACXAQAgAzgAALIMACCDBQAAswwAIIkFAACLAgAgAzgAALAMACCDBQAAsQwAIIkFAABMACAAAAAAAAKGBQEAAAAEjAUBAAAABQs4AADYCQAwOQAA3QkAMIMFAADZCQAwhAUAANoJADCFBQAA2wkAIIYFAADcCQAwhwUAANwJADCIBQAA3AkAMIkFAADcCQAwigUAAN4JADCLBQAA3wkAMAwDAADOCQAgHQAA0AkAIPMDAQAAAAH3AwEAAAABhgRAAAAAAaQEQAAAAAGuBCAAAAABwAQBAAAAAdwEAAAA3AQC3QRAAAAAAd4EQAAAAAHfBCAAAAABAgAAAFAAIDgAAOMJACADAAAAUAAgOAAA4wkAIDkAAOIJACABMQAArwwAMBEDAACpBgAgHAAA_AYAIB0AAP0GACDwAwAA-wYAMPEDAABOABDyAwAA-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-QcAMIcFAAD5BwAwiAUAAPkHADCJBQAA-QcAMIoFAACxCwAwiwUAAPwHADALOAAAowsAMDkAAKcLADCDBQAApAsAMIQFAAClCwAwhQUAAKYLACCGBQAAmgkAMIcFAACaCQAwiAUAAJoJADCJBQAAmgkAMIoFAACoCwAwiwUAAJ0JADALOAAAmgsAMDkAAJ4LADCDBQAAmwsAMIQFAACcCwAwhQUAAJ0LACCGBQAA7QcAMIcFAADtBwAwiAUAAO0HADCJBQAA7QcAMIoFAACfCwAwiwUAAPAHADALOAAAjgsAMDkAAJMLADCDBQAAjwsAMIQFAACQCwAwhQUAAJELACCGBQAAkgsAMIcFAACSCwAwiAUAAJILADCJBQAAkgsAMIoFAACUCwAwiwUAAJULADALOAAAggsAMDkAAIcLADCDBQAAgwsAMIQFAACECwAwhQUAAIULACCGBQAAhgsAMIcFAACGCwAwiAUAAIYLADCJBQAAhgsAMIoFAACICwAwiwUAAIkLADAHOAAA_QoAIDkAAIALACCDBQAA_goAIIQFAAD_CgAghwUAAE4AIIgFAABOACCJBQAAUAAgCzgAAPEKADA5AAD2CgAwgwUAAPIKADCEBQAA8woAMIUFAAD0CgAghgUAAPUKADCHBQAA9QoAMIgFAAD1CgAwiQUAAPUKADCKBQAA9woAMIsFAAD4CgAwCzgAAOUKADA5AADqCgAwgwUAAOYKADCEBQAA5woAMIUFAADoCgAghgUAAOkKADCHBQAA6QoAMIgFAADpCgAwiQUAAOkKADCKBQAA6woAMIsFAADsCgAwCzgAANwKADA5AADgCgAwgwUAAN0KADCEBQAA3goAMIUFAADfCgAghgUAAI4JADCHBQAAjgkAMIgFAACOCQAwiQUAAI4JADCKBQAA4QoAMIsFAACRCQAwCzgAANMKADA5AADXCgAwgwUAANQKADCEBQAA1QoAMIUFAADWCgAghgUAAIIJADCHBQAAggkAMIgFAACCCQAwiQUAAIIJADCKBQAA2AoAMIsFAACFCQAwCzgAAMcKADA5AADMCgAwgwUAAMgKADCEBQAAyQoAMIUFAADKCgAghgUAAMsKADCHBQAAywoAMIgFAADLCgAwiQUAAMsKADCKBQAAzQoAMIsFAADOCgAwCzgAAL4KADA5AADCCgAwgwUAAL8KADCEBQAAwAoAMIUFAADBCgAghgUAAOoIADCHBQAA6ggAMIgFAADqCAAwiQUAAOoIADCKBQAAwwoAMIsFAADtCAAwCzgAALUKADA5AAC5CgAwgwUAALYKADCEBQAAtwoAMIUFAAC4CgAghgUAAK0KADCHBQAArQoAMIgFAACtCgAwiQUAAK0KADCKBQAAugoAMIsFAACwCgAwCzgAAKkKADA5AACuCgAwgwUAAKoKADCEBQAAqwoAMIUFAACsCgAghgUAAK0KADCHBQAArQoAMIgFAACtCgAwiQUAAK0KADCKBQAArwoAMIsFAACwCgAwBzgAAKQKACA5AACnCgAggwUAAKUKACCEBQAApgoAIIcFAABtACCIBQAAbQAgiQUAAOMEACAHOAAAnwoAIDkAAKIKACCDBQAAoAoAIIQFAAChCgAghwUAAG8AIIgFAABvACCJBQAAAQAgCfMDAQAAAAH0AwEAAAABhAQBAAAAAYYEQAAAAAGiBCAAAAABowRAAAAAAaQEQAAAAAGlBAEAAAABpgQBAAAAAQIAAAABACA4AACfCgAgAwAAAG8AIDgAAJ8KACA5AACjCgAgCwAAAG8AIDEAAKMKACDzAwEAoQcAIfQDAQChBwAhhAQBAKEHACGGBEAAowcAIaIEIACpBwAhowRAAMAHACGkBEAAowcAIaUEAQCiBwAhpgQBAKIHACEJ8wMBAKEHACH0AwEAoQcAIYQEAQChBwAhhgRAAKMHACGiBCAAqQcAIaMEQADABwAhpARAAKMHACGlBAEAogcAIaYEAQCiBwAhE_MDAQAAAAH0AwEAAAABhAQBAAAAAYYEQAAAAAGiBCAAAAABowRAAAAAAaQEQAAAAAGlBAEAAAABpgQBAAAAAacEAQAAAAGoBAEAAAABqQQBAAAAAaoEAgAAAAGrBIAAAAABrAQgAAAAAa0EAgAAAAGuBCAAAAABrwQBAAAAAbAEQAAAAAECAAAA4wQAIDgAAKQKACADAAAAbQAgOAAApAoAIDkAAKgKACAVAAAAbQAgMQAAqAoAIPMDAQChBwAh9AMBAKEHACGEBAEAoQcAIYYEQACjBwAhogQgAKkHACGjBEAAwAcAIaQEQACjBwAhpQQBAKIHACGmBAEAogcAIacEAQCiBwAhqAQBAKIHACGpBAEAogcAIaoEAgCvBwAhqwSAAAAAAawEIACpBwAhrQQCAK8HACGuBCAAqQcAIa8EAQCiBwAhsARAAKMHACET8wMBAKEHACH0AwEAoQcAIYQEAQChBwAhhgRAAKMHACGiBCAAqQcAIaMEQADABwAhpARAAKMHACGlBAEAogcAIaYEAQCiBwAhpwQBAKIHACGoBAEAogcAIakEAQCiBwAhqgQCAK8HACGrBIAAAAABrAQgAKkHACGtBAIArwcAIa4EIACpBwAhrwQBAKIHACGwBEAAowcAIQMoAADPBwAghgRAAAAAAbIEAQAAAAECAAAAagAgOAAAtAoAIAMAAABqACA4AAC0CgAgOQAAswoAIAExAACeDAAwCScAAKkGACAoAACpBgAg8AMAAPcGADDxAwAAaAAQ8gMAAPcGADCGBEAAkgYAIbEEAQCQBgAhsgQBAJAGACH8BAAA9gYAIAIAAABqACAxAACzCgAgAgAAALEKACAxAACyCgAgBvADAACwCgAw8QMAALEKABDyAwAAsAoAMIYEQACSBgAhsQQBAJAGACGyBAEAkAYAIQbwAwAAsAoAMPEDAACxCgAQ8gMAALAKADCGBEAAkgYAIbEEAQCQBgAhsgQBAJAGACEChgRAAKMHACGyBAEAoQcAIQMoAADNBwAghgRAAKMHACGyBAEAoQcAIQMoAADPBwAghgRAAAAAAbIEAQAAAAEDJwAAzgcAIIYEQAAAAAGxBAEAAAABAgAAAGoAIDgAAL0KACADAAAAagAgOAAAvQoAIDkAALwKACABMQAAnQwAMAIAAABqACAxAAC8CgAgAgAAALEKACAxAAC7CgAgAoYEQACjBwAhsQQBAKEHACEDJwAAzAcAIIYEQACjBwAhsQQBAKEHACEDJwAAzgcAIIYEQAAAAAGxBAEAAAABCAYAAIwIACDzAwEAAAABhgRAAAAAAaIEIAAAAAGjBEAAAAABtAQBAAAAAbwEAAAAvAQCvQQBAAAAAQIAAAA5ACA4AADGCgAgAwAAADkAIDgAAMYKACA5AADFCgAgATEAAJwMADACAAAAOQAgMQAAxQoAIAIAAADuCAAgMQAAxAoAIAfzAwEAoQcAIYYEQACjBwAhogQgAKkHACGjBEAAwAcAIbQEAQChBwAhvAQAAIkIvAQivQQBAKEHACEIBgAAiggAIPMDAQChBwAhhgRAAKMHACGiBCAAqQcAIaMEQADABwAhtAQBAKEHACG8BAAAiQi8BCK9BAEAoQcAIQgGAACMCAAg8wMBAAAAAYYEQAAAAAGiBCAAAAABowRAAAAAAbQEAQAAAAG8BAAAALwEAr0EAQAAAAEF8wMBAAAAAfQDAQAAAAH1AwEAAAAB9gMBAAAAAfgDQAAAAAECAAAAZQAgOAAA0goAIAMAAABlACA4AADSCgAgOQAA0QoAIAExAACbDAAwCgMAAKkGACDwAwAA-AYAMPEDAABjABDyAwAA-AYAMPMDAQAAAAH0AwEAkAYAIfUDAQCQBgAh9gMBAKMGACH3AwEAkAYAIfgDQACSBgAhAgAAAGUAIDEAANEKACACAAAAzwoAIDEAANAKACAJ8AMAAM4KADDxAwAAzwoAEPIDAADOCgAw8wMBAJAGACH0AwEAkAYAIfUDAQCQBgAh9gMBAKMGACH3AwEAkAYAIfgDQACSBgAhCfADAADOCgAw8QMAAM8KABDyAwAAzgoAMPMDAQCQBgAh9AMBAJAGACH1AwEAkAYAIfYDAQCjBgAh9wMBAJAGACH4A0AAkgYAIQXzAwEAoQcAIfQDAQChBwAh9QMBAKEHACH2AwEAogcAIfgDQACjBwAhBfMDAQChBwAh9AMBAKEHACH1AwEAoQcAIfYDAQCiBwAh-ANAAKMHACEF8wMBAAAAAfQDAQAAAAH1AwEAAAAB9gMBAAAAAfgDQAAAAAEGBgAAmQgAIPMDAQAAAAGGBEAAAAABogQgAAAAAaMEQAAAAAG0BAEAAAABAgAAADEAIDgAANsKACADAAAAMQAgOAAA2woAIDkAANoKACABMQAAmgwAMAIAAAAxACAxAADaCgAgAgAAAIYJACAxAADZCgAgBfMDAQChBwAhhgRAAKMHACGiBCAAqQcAIaMEQADABwAhtAQBAKEHACEGBgAAlwgAIPMDAQChBwAhhgRAAKMHACGiBCAAqQcAIaMEQADABwAhtAQBAKEHACEGBgAAmQgAIPMDAQAAAAGGBEAAAAABogQgAAAAAaMEQAAAAAG0BAEAAAABBgYAAKMIACDzAwEAAAABtAQBAAAAAb8ECAAAAAHABAEAAAABwQRAAAAAAQIAAAAtACA4AADkCgAgAwAAAC0AIDgAAOQKACA5AADjCgAgATEAAJkMADACAAAALQAgMQAA4woAIAIAAACSCQAgMQAA4goAIAXzAwEAoQcAIbQEAQChBwAhvwQIAJ8IACHABAEAoQcAIcEEQACjBwAhBgYAAKEIACDzAwEAoQcAIbQEAQChBwAhvwQIAJ8IACHABAEAoQcAIcEEQACjBwAhBgYAAKMIACDzAwEAAAABtAQBAAAAAb8ECAAAAAHABAEAAAABwQRAAAAAAQTzAwEAAAABhgRAAAAAAYcEAQAAAAGIBAIAAAABAgAAAF8AIDgAAPAKACADAAAAXwAgOAAA8AoAIDkAAO8KACABMQAAmAwAMAkDAACpBgAg8AMAAPkGADDxAwAAXQAQ8gMAAPkGADDzAwEAAAAB9wMBAJAGACGGBEAAkgYAIYcEAQCQBgAhiAQCAKgGACECAAAAXwAgMQAA7woAIAIAAADtCgAgMQAA7goAIAjwAwAA7AoAMPEDAADtCgAQ8gMAAOwKADDzAwEAkAYAIfcDAQCQBgAhhgRAAJIGACGHBAEAkAYAIYgEAgCoBgAhCPADAADsCgAw8QMAAO0KABDyAwAA7AoAMPMDAQCQBgAh9wMBAJAGACGGBEAAkgYAIYcEAQCQBgAhiAQCAKgGACEE8wMBAKEHACGGBEAAowcAIYcEAQChBwAhiAQCAK8HACEE8wMBAKEHACGGBEAAowcAIYcEAQChBwAhiAQCAK8HACEE8wMBAAAAAYYEQAAAAAGHBAEAAAABiAQCAAAAAQnzAwEAAAABhgRAAAAAAYkEAQAAAAGKBAEAAAABiwQBAAAAAY0EgAAAAAGOBIAAAAABjwQBAAAAAZAEAQAAAAECAAAAWwAgOAAA_AoAIAMAAABbACA4AAD8CgAgOQAA-woAIAExAACXDAAwDiAAAKkGACDwAwAA-gYAMPEDAABZABDyAwAA-gYAMPMDAQAAAAGGBEAAkgYAIYkEAQCQBgAhigQBAJAGACGLBAEAkAYAIYwEAQCQBgAhjQQAAKQGACCOBAAApAYAII8EAQCjBgAhkAQBAKMGACECAAAAWwAgMQAA-woAIAIAAAD5CgAgMQAA-goAIA3wAwAA-AoAMPEDAAD5CgAQ8gMAAPgKADDzAwEAkAYAIYYEQACSBgAhiQQBAJAGACGKBAEAkAYAIYsEAQCQBgAhjAQBAJAGACGNBAAApAYAII4EAACkBgAgjwQBAKMGACGQBAEAowYAIQ3wAwAA-AoAMPEDAAD5CgAQ8gMAAPgKADDzAwEAkAYAIYYEQACSBgAhiQQBAJAGACGKBAEAkAYAIYsEAQCQBgAhjAQBAJAGACGNBAAApAYAII4EAACkBgAgjwQBAKMGACGQBAEAowYAIQnzAwEAoQcAIYYEQACjBwAhiQQBAKEHACGKBAEAoQcAIYsEAQChBwAhjQSAAAAAAY4EgAAAAAGPBAEAogcAIZAEAQCiBwAhCfMDAQChBwAhhgRAAKMHACGJBAEAoQcAIYoEAQChBwAhiwQBAKEHACGNBIAAAAABjgSAAAAAAY8EAQCiBwAhkAQBAKIHACEJ8wMBAAAAAYYEQAAAAAGJBAEAAAABigQBAAAAAYsEAQAAAAGNBIAAAAABjgSAAAAAAY8EAQAAAAGQBAEAAAABDBwAAM8JACAdAADQCQAg8wMBAAAAAYYEQAAAAAGkBEAAAAABrgQgAAAAAcAEAQAAAAHcBAAAANwEAt0EQAAAAAHeBEAAAAAB3wQgAAAAAeAEAQAAAAECAAAAUAAgOAAA_QoAIAMAAABOACA4AAD9CgAgOQAAgQsAIA4AAABOACAcAADMCQAgHQAAzQkAIDEAAIELACDzAwEAoQcAIYYEQACjBwAhpARAAKMHACGuBCAAqQcAIcAEAQCiBwAh3AQAAMoJ3AQi3QRAAKMHACHeBEAAwAcAId8EIACpBwAh4AQBAKIHACEMHAAAzAkAIB0AAM0JACDzAwEAoQcAIYYEQACjBwAhpARAAKMHACGuBCAAqQcAIcAEAQCiBwAh3AQAAMoJ3AQi3QRAAKMHACHeBEAAwAcAId8EIACpBwAh4AQBAKIHACEJGwAA-QkAIPMDAQAAAAGGBEAAAAABpARAAAAAAbwEAAAA5wQCvwQIAAAAAecEAQAAAAHoBAEAAAAB6QSAAAAAAQIAAABMACA4AACNCwAgAwAAAEwAIDgAAI0LACA5AACMCwAgATEAAJYMADAOAwAAqQYAIBsAAM8GACDwAwAA_gYAMPEDAABKABDyAwAA_gYAMPMDAQAAAAH3AwEAkAYAIYYEQACSBgAhpARAAJIGACG8BAAA_wbnBCK_BAgAzgYAIecEAQAAAAHoBAEAowYAIekEAACkBgAgAgAAAEwAIDEAAIwLACACAAAAigsAIDEAAIsLACAM8AMAAIkLADDxAwAAigsAEPIDAACJCwAw8wMBAJAGACH3AwEAkAYAIYYEQACSBgAhpARAAJIGACG8BAAA_wbnBCK_BAgAzgYAIecEAQCjBgAh6AQBAKMGACHpBAAApAYAIAzwAwAAiQsAMPEDAACKCwAQ8gMAAIkLADDzAwEAkAYAIfcDAQCQBgAhhgRAAJIGACGkBEAAkgYAIbwEAAD_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_CQAgEgAAwQkAIBMAAMIJACAUAADDCQAgFQAAxAkAIBYAAMUJACAYAADGCQAg8wMBAAAAAfUDAQAAAAGGBEAAAAABmQQBAAAAAaIEIAAAAAGjBEAAAAABpARAAAAAAbwEAAAAvAQCwwQBAAAAAckEAQAAAAHKBAEAAAABywQAAL0JACDMBAEAAAABzQQBAAAAAc4EQAAAAAHPBCAAAAAB0AQIAAAAAdEEIAAAAAHSBEAAAAAB0wQCAAAAAdQEAgAAAAHVBAIAAAAB1gQIAAAAAdcEQAAAAAECAAAADQAgOAAAwAsAIAMAAAANACA4AADACwAgOQAAvwsAIAExAACRDAAwJQoAAMEGACAMAAC9BgAgDQAAqQYAIBIAAOUGACATAADmBgAgFAAA7QYAIBUAAO4GACAWAACaBwAgGAAA8AYAIPADAACYBwAw8QMAAAsAEPIDAACYBwAw8wMBAAAAAfUDAQCQBgAhhgRAAJIGACGZBAEAkAYAIaIEIACRBgAhowRAAKUGACGkBEAAkgYAIbcEAQCQBgAhvAQAAIMHvAQiwwQBAAAAAckEAQCQBgAhygQBAJAGACHLBAAAwwYAIMwEAQCjBgAhzQQBAKMGACHOBEAApQYAIc8EIACRBgAh0AQIAJkHACHRBCAAkQYAIdIEQAClBgAh0wQCAKgGACHUBAIAqAYAIdUEAgCoBgAh1gQIAM4GACHXBEAApQYAIQIAAAANACAxAAC_CwAgAgAAAL0LACAxAAC-CwAgHPADAAC8CwAw8QMAAL0LABDyAwAAvAsAMPMDAQCQBgAh9QMBAJAGACGGBEAAkgYAIZkEAQCQBgAhogQgAJEGACGjBEAApQYAIaQEQACSBgAhtwQBAJAGACG8BAAAgwe8BCLDBAEAowYAIckEAQCQBgAhygQBAJAGACHLBAAAwwYAIMwEAQCjBgAhzQQBAKMGACHOBEAApQYAIc8EIACRBgAh0AQIAJkHACHRBCAAkQYAIdIEQAClBgAh0wQCAKgGACHUBAIAqAYAIdUEAgCoBgAh1gQIAM4GACHXBEAApQYAIRzwAwAAvAsAMPEDAAC9CwAQ8gMAALwLADDzAwEAkAYAIfUDAQCQBgAhhgRAAJIGACGZBAEAkAYAIaIEIACRBgAhowRAAKUGACGkBEAAkgYAIbcEAQCQBgAhvAQAAIMHvAQiwwQBAKMGACHJBAEAkAYAIcoEAQCQBgAhywQAAMMGACDMBAEAowYAIc0EAQCjBgAhzgRAAKUGACHPBCAAkQYAIdAECACZBwAh0QQgAJEGACHSBEAApQYAIdMEAgCoBgAh1AQCAKgGACHVBAIAqAYAIdYECADOBgAh1wRAAKUGACEY8wMBAKEHACH1AwEAoQcAIYYEQACjBwAhmQQBAKEHACGiBCAAqQcAIaMEQADABwAhpARAAKMHACG8BAAAiQi8BCLDBAEAogcAIckEAQChBwAhygQBAKEHACHLBAAA2wgAIMwEAQCiBwAhzQQBAKIHACHOBEAAwAcAIc8EIACpBwAh0AQIANwIACHRBCAAqQcAIdIEQADABwAh0wQCAK8HACHUBAIArwcAIdUEAgCvBwAh1gQIAJ8IACHXBEAAwAcAISAKAADdCAAgDAAA3ggAIBIAAOAIACATAADhCAAgFAAA4ggAIBUAAOMIACAWAADkCAAgGAAA5QgAIPMDAQChBwAh9QMBAKEHACGGBEAAowcAIZkEAQChBwAhogQgAKkHACGjBEAAwAcAIaQEQACjBwAhvAQAAIkIvAQiwwQBAKIHACHJBAEAoQcAIcoEAQChBwAhywQAANsIACDMBAEAogcAIc0EAQCiBwAhzgRAAMAHACHPBCAAqQcAIdAECADcCAAh0QQgAKkHACHSBEAAwAcAIdMEAgCvBwAh1AQCAK8HACHVBAIArwcAIdYECACfCAAh1wRAAMAHACEgCgAAvgkAIAwAAL8JACASAADBCQAgEwAAwgkAIBQAAMMJACAVAADECQAgFgAAxQkAIBgAAMYJACDzAwEAAAAB9QMBAAAAAYYEQAAAAAGZBAEAAAABogQgAAAAAaMEQAAAAAGkBEAAAAABvAQAAAC8BALDBAEAAAAByQQBAAAAAcoEAQAAAAHLBAAAvQkAIMwEAQAAAAHNBAEAAAABzgRAAAAAAc8EIAAAAAHQBAgAAAAB0QQgAAAAAdIEQAAAAAHTBAIAAAAB1AQCAAAAAdUEAgAAAAHWBAgAAAAB1wRAAAAAAQfzAwEAAAABhgRAAAAAAY8EAQAAAAGQBAEAAAABpARAAAAAAesEQAAAAAH1BAEAAAABAgAAAAkAIDgAAMwLACADAAAACQAgOAAAzAsAIDkAAMsLACABMQAAkAwAMAwDAACpBgAg8AMAAJsHADDxAwAABwAQ8gMAAJsHADDzAwEAAAAB9wMBAJAGACGGBEAAkgYAIY8EAQCjBgAhkAQBAKMGACGkBEAAkgYAIesEQACSBgAh9QQBAAAAAQIAAAAJACAxAADLCwAgAgAAAMkLACAxAADKCwAgC_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-gQC-wQgAAAAAQIAAACXAQAgOAAAigwAIAMAAACaAQAgOAAAigwAIDkAAI4MACAgAAAAmgEAIAQAAIwKACAFAACNCgAgBwAAjgoAIBIAAI8KACATAACQCgAgGQAAkQoAIBoAAJIKACAeAACTCgAgHwAAlAoAICEAAJUKACAiAACWCgAgIwAAlwoAICQAAJgKACAlAACZCgAgJgAAmgoAICgAAJwKACApAACbCgAgKgAAnQoAIDEAAI4MACDzAwEAoQcAIfQDAQChBwAhhAQBAKEHACGGBEAAowcAIaIEIACpBwAhowRAAMAHACGkBEAAowcAIbwEAACKCvkEIvYEIACpBwAh9wQBAKIHACH6BAAAiwr6BCL7BCAAqQcAIR4EAACMCgAgBQAAjQoAIAcAAI4KACASAACPCgAgEwAAkAoAIBkAAJEKACAaAACSCgAgHgAAkwoAIB8AAJQKACAhAACVCgAgIgAAlgoAICMAAJcKACAkAACYCgAgJQAAmQoAICYAAJoKACAoAACcCgAgKQAAmwoAICoAAJ0KACDzAwEAoQcAIfQDAQChBwAhhAQBAKEHACGGBEAAowcAIaIEIACpBwAhowRAAMAHACGkBEAAowcAIbwEAACKCvkEIvYEIACpBwAh9wQBAKIHACH6BAAAiwr6BCL7BCAAqQcAIQzzAwEAAAABhgRAAAAAAaQEQAAAAAHsBAEAAAAB7QQBAAAAAe4EAQAAAAHvBAEAAAAB8AQBAAAAAfEEQAAAAAHyBEAAAAAB8wQBAAAAAfQEAQAAAAEH8wMBAAAAAYYEQAAAAAGPBAEAAAABkAQBAAAAAaQEQAAAAAHrBEAAAAAB9QQBAAAAARjzAwEAAAAB9QMBAAAAAYYEQAAAAAGZBAEAAAABogQgAAAAAaMEQAAAAAGkBEAAAAABvAQAAAC8BALDBAEAAAAByQQBAAAAAcoEAQAAAAHLBAAAvQkAIMwEAQAAAAHNBAEAAAABzgRAAAAAAc8EIAAAAAHQBAgAAAAB0QQgAAAAAdIEQAAAAAHTBAIAAAAB1AQCAAAAAdUEAgAAAAHWBAgAAAAB1wRAAAAAAQjzAwEAAAABhgRAAAAAAaAEAQAAAAGiBCAAAAABpARAAAAAAbQEAQAAAAG4BAEAAAABuQQgAAAAAQXzAwEAAAABhgRAAAAAAaQEQAAAAAGzBAIAAAABtAQBAAAAAQOGBEAAAAABmAQAAAC3BAK1BAEAAAABBzGAAAAAAfMDAQAAAAGGBEAAAAABmAQAAACYBAKZBAEAAAABmgQBAAAAAZsEIAAAAAEI8wMBAAAAAYYEQAAAAAGkBEAAAAABvAQAAADnBAK_BAgAAAAB5wQBAAAAAegEAQAAAAHpBIAAAAABCfMDAQAAAAGGBEAAAAABiQQBAAAAAYoEAQAAAAGLBAEAAAABjQSAAAAAAY4EgAAAAAGPBAEAAAABkAQBAAAAAQTzAwEAAAABhgRAAAAAAYcEAQAAAAGIBAIAAAABBfMDAQAAAAG0BAEAAAABvwQIAAAAAcAEAQAAAAHBBEAAAAABBfMDAQAAAAGGBEAAAAABogQgAAAAAaMEQAAAAAG0BAEAAAABBfMDAQAAAAH0AwEAAAAB9QMBAAAAAfYDAQAAAAH4A0AAAAABB_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_BAgAAAAB5wQBAAAAAegEAQAAAAHpBIAAAAABAgAAAEwAIDgAALAMACAN8wMBAAAAAfQDAQAAAAH1AwEAAAABhgRAAAAAAaQEQAAAAAGuBCAAAAAB0AQIAAAAAdwEAAAA3AQC4QQCAAAAAeIEAADkCQAg4wQCAAAAAeQEIAAAAAHlBAEAAAABAgAAAIsCACA4AACyDAAgHgQAANkLACAFAADaCwAgBwAA2wsAIBIAANwLACATAADdCwAgGQAA3gsAIBoAAN8LACAeAADgCwAgIQAA4gsAICIAAOMLACAjAADkCwAgJAAA5QsAICUAAOYLACAmAADnCwAgKAAA6QsAICkAAOgLACAqAADqCwAgKwAA6wsAIPMDAQAAAAH0AwEAAAABhAQBAAAAAYYEQAAAAAGiBCAAAAABowRAAAAAAaQEQAAAAAG8BAAAAPkEAvYEIAAAAAH3BAEAAAAB-gQAAAD6BAL7BCAAAAABAgAAAJcBACA4AAC0DAAgAwAAAEoAIDgAALAMACA5AAC4DAAgDAAAAEoAIAMAAO0JACAxAAC4DAAg8wMBAKEHACH3AwEAoQcAIYYEQACjBwAhpARAAKMHACG8BAAA7AnnBCK_BAgAnwgAIecEAQCiBwAh6AQBAKIHACHpBIAAAAABCgMAAO0JACDzAwEAoQcAIfcDAQChBwAhhgRAAKMHACGkBEAAowcAIbwEAADsCecEIr8ECACfCAAh5wQBAKIHACHoBAEAogcAIekEgAAAAAEDAAAAUgAgOAAAsgwAIDkAALsMACAPAAAAUgAgMQAAuwwAIPMDAQChBwAh9AMBAKEHACH1AwEAogcAIYYEQACjBwAhpARAAKMHACGuBCAAqQcAIdAECACfCAAh3AQAAMoJ3AQi4QQCAK8HACHiBAAA1gkAIOMEAgCvBwAh5AQgAKkHACHlBAEAogcAIQ3zAwEAoQcAIfQDAQChBwAh9QMBAKIHACGGBEAAowcAIaQEQACjBwAhrgQgAKkHACHQBAgAnwgAIdwEAADKCdwEIuEEAgCvBwAh4gQAANYJACDjBAIArwcAIeQEIACpBwAh5QQBAKIHACEDAAAAmgEAIDgAALQMACA5AAC-DAAgIAAAAJoBACAEAACMCgAgBQAAjQoAIAcAAI4KACASAACPCgAgEwAAkAoAIBkAAJEKACAaAACSCgAgHgAAkwoAICEAAJUKACAiAACWCgAgIwAAlwoAICQAAJgKACAlAACZCgAgJgAAmgoAICgAAJwKACApAACbCgAgKgAAnQoAICsAAJ4KACAxAAC-DAAg8wMBAKEHACH0AwEAoQcAIYQEAQChBwAhhgRAAKMHACGiBCAAqQcAIaMEQADABwAhpARAAKMHACG8BAAAigr5BCL2BCAAqQcAIfcEAQCiBwAh-gQAAIsK-gQi-wQgAKkHACEeBAAAjAoAIAUAAI0KACAHAACOCgAgEgAAjwoAIBMAAJAKACAZAACRCgAgGgAAkgoAIB4AAJMKACAhAACVCgAgIgAAlgoAICMAAJcKACAkAACYCgAgJQAAmQoAICYAAJoKACAoAACcCgAgKQAAmwoAICoAAJ0KACArAACeCgAg8wMBAKEHACH0AwEAoQcAIYQEAQChBwAhhgRAAKMHACGiBCAAqQcAIaMEQADABwAhpARAAKMHACG8BAAAigr5BCL2BCAAqQcAIfcEAQCiBwAh-gQAAIsK-gQi-wQgAKkHACEeBAAA2QsAIAUAANoLACASAADcCwAgEwAA3QsAIBkAAN4LACAaAADfCwAgHgAA4AsAIB8AAOELACAhAADiCwAgIgAA4wsAICMAAOQLACAkAADlCwAgJQAA5gsAICYAAOcLACAoAADpCwAgKQAA6AsAICoAAOoLACArAADrCwAg8wMBAAAAAfQDAQAAAAGEBAEAAAABhgRAAAAAAaIEIAAAAAGjBEAAAAABpARAAAAAAbwEAAAA-QQC9gQgAAAAAfcEAQAAAAH6BAAAAPoEAvsEIAAAAAECAAAAlwEAIDgAAL8MACACsARAAAAAAccEAQAAAAECsARAAAAAAcIEAQAAAAEI8wMBAAAAAYYEQAAAAAGgBAEAAAABogQgAAAAAaQEQAAAAAG3BAEAAAABuAQBAAAAAbkEIAAAAAEF8wMBAAAAAfcDAQAAAAGGBEAAAAABpARAAAAAAbMEAgAAAAEF8wMBAAAAAfcDAQAAAAG_BAgAAAABwAQBAAAAAcEEQAAAAAEF8wMBAAAAAfcDAQAAAAGGBEAAAAABogQgAAAAAaMEQAAAAAEF8wMBAAAAAYYEQAAAAAGYBAEAAAABmQQBAAAAAb4EAQAAAAEH8wMBAAAAAYYEQAAAAAGiBCAAAAABowRAAAAAAboEAQAAAAG8BAAAALwEAr0EAQAAAAEDAAAAmgEAIDgAAL8MACA5AADLDAAgIAAAAJoBACAEAACMCgAgBQAAjQoAIBIAAI8KACATAACQCgAgGQAAkQoAIBoAAJIKACAeAACTCgAgHwAAlAoAICEAAJUKACAiAACWCgAgIwAAlwoAICQAAJgKACAlAACZCgAgJgAAmgoAICgAAJwKACApAACbCgAgKgAAnQoAICsAAJ4KACAxAADLDAAg8wMBAKEHACH0AwEAoQcAIYQEAQChBwAhhgRAAKMHACGiBCAAqQcAIaMEQADABwAhpARAAKMHACG8BAAAigr5BCL2BCAAqQcAIfcEAQCiBwAh-gQAAIsK-gQi-wQgAKkHACEeBAAAjAoAIAUAAI0KACASAACPCgAgEwAAkAoAIBkAAJEKACAaAACSCgAgHgAAkwoAIB8AAJQKACAhAACVCgAgIgAAlgoAICMAAJcKACAkAACYCgAgJQAAmQoAICYAAJoKACAoAACcCgAgKQAAmwoAICoAAJ0KACArAACeCgAg8wMBAKEHACH0AwEAoQcAIYQEAQChBwAhhgRAAKMHACGiBCAAqQcAIaMEQADABwAhpARAAKMHACG8BAAAigr5BCL2BCAAqQcAIfcEAQCiBwAh-gQAAIsK-gQi-wQgAKkHACECsARAAAAAAbQEAQAAAAEL8wMBAAAAAfQDAQAAAAH1AwEAAAAB9gMBAAAAAYYEQAAAAAGiBCAAAAABowRAAAAAAaQEQAAAAAGuBCAAAAABwwQBAAAAAcgEAQAAAAECAAAA0wIAIDgAAM0MACAhDAAAvwkAIA0AAMAJACASAADBCQAgEwAAwgkAIBQAAMMJACAVAADECQAgFgAAxQkAIBgAAMYJACDzAwEAAAAB9QMBAAAAAYYEQAAAAAGZBAEAAAABogQgAAAAAaMEQAAAAAGkBEAAAAABtwQBAAAAAbwEAAAAvAQCwwQBAAAAAckEAQAAAAHKBAEAAAABywQAAL0JACDMBAEAAAABzQQBAAAAAc4EQAAAAAHPBCAAAAAB0AQIAAAAAdEEIAAAAAHSBEAAAAAB0wQCAAAAAdQEAgAAAAHVBAIAAAAB1gQIAAAAAdcEQAAAAAECAAAADQAgOAAAzwwAIAMAAADWAgAgOAAAzQwAIDkAANMMACANAAAA1gIAIDEAANMMACDzAwEAoQcAIfQDAQChBwAh9QMBAKIHACH2AwEAogcAIYYEQACjBwAhogQgAKkHACGjBEAAwAcAIaQEQACjBwAhrgQgAKkHACHDBAEAoQcAIcgEAQCiBwAhC_MDAQChBwAh9AMBAKEHACH1AwEAogcAIfYDAQCiBwAhhgRAAKMHACGiBCAAqQcAIaMEQADABwAhpARAAKMHACGuBCAAqQcAIcMEAQChBwAhyAQBAKIHACEDAAAACwAgOAAAzwwAIDkAANYMACAjAAAACwAgDAAA3ggAIA0AAN8IACASAADgCAAgEwAA4QgAIBQAAOIIACAVAADjCAAgFgAA5AgAIBgAAOUIACAxAADWDAAg8wMBAKEHACH1AwEAoQcAIYYEQACjBwAhmQQBAKEHACGiBCAAqQcAIaMEQADABwAhpARAAKMHACG3BAEAoQcAIbwEAACJCLwEIsMEAQCiBwAhyQQBAKEHACHKBAEAoQcAIcsEAADbCAAgzAQBAKIHACHNBAEAogcAIc4EQADABwAhzwQgAKkHACHQBAgA3AgAIdEEIACpBwAh0gRAAMAHACHTBAIArwcAIdQEAgCvBwAh1QQCAK8HACHWBAgAnwgAIdcEQADABwAhIQwAAN4IACANAADfCAAgEgAA4AgAIBMAAOEIACAUAADiCAAgFQAA4wgAIBYAAOQIACAYAADlCAAg8wMBAKEHACH1AwEAoQcAIYYEQACjBwAhmQQBAKEHACGiBCAAqQcAIaMEQADABwAhpARAAKMHACG3BAEAoQcAIbwEAACJCLwEIsMEAQCiBwAhyQQBAKEHACHKBAEAoQcAIcsEAADbCAAgzAQBAKIHACHNBAEAogcAIc4EQADABwAhzwQgAKkHACHQBAgA3AgAIdEEIACpBwAh0gRAAMAHACHTBAIArwcAIdQEAgCvBwAh1QQCAK8HACHWBAgAnwgAIdcEQADABwAhArAEQAAAAAG0BAEAAAABB_MDAQAAAAH0AwEAAAABhgRAAAAAAaIEIAAAAAGjBEAAAAABpARAAAAAAcMEAQAAAAECAAAAggMAIDgAANgMACAhCgAAvgkAIA0AAMAJACASAADBCQAgEwAAwgkAIBQAAMMJACAVAADECQAgFgAAxQkAIBgAAMYJACDzAwEAAAAB9QMBAAAAAYYEQAAAAAGZBAEAAAABogQgAAAAAaMEQAAAAAGkBEAAAAABtwQBAAAAAbwEAAAAvAQCwwQBAAAAAckEAQAAAAHKBAEAAAABywQAAL0JACDMBAEAAAABzQQBAAAAAc4EQAAAAAHPBCAAAAAB0AQIAAAAAdEEIAAAAAHSBEAAAAAB0wQCAAAAAdQEAgAAAAHVBAIAAAAB1gQIAAAAAdcEQAAAAAECAAAADQAgOAAA2gwAIAMAAACFAwAgOAAA2AwAIDkAAN4MACAJAAAAhQMAIDEAAN4MACDzAwEAoQcAIfQDAQChBwAhhgRAAKMHACGiBCAAqQcAIaMEQADABwAhpARAAKMHACHDBAEAoQcAIQfzAwEAoQcAIfQDAQChBwAhhgRAAKMHACGiBCAAqQcAIaMEQADABwAhpARAAKMHACHDBAEAoQcAIQMAAAALACA4AADaDAAgOQAA4QwAICMAAAALACAKAADdCAAgDQAA3wgAIBIAAOAIACATAADhCAAgFAAA4ggAIBUAAOMIACAWAADkCAAgGAAA5QgAIDEAAOEMACDzAwEAoQcAIfUDAQChBwAhhgRAAKMHACGZBAEAoQcAIaIEIACpBwAhowRAAMAHACGkBEAAowcAIbcEAQChBwAhvAQAAIkIvAQiwwQBAKIHACHJBAEAoQcAIcoEAQChBwAhywQAANsIACDMBAEAogcAIc0EAQCiBwAhzgRAAMAHACHPBCAAqQcAIdAECADcCAAh0QQgAKkHACHSBEAAwAcAIdMEAgCvBwAh1AQCAK8HACHVBAIArwcAIdYECACfCAAh1wRAAMAHACEhCgAA3QgAIA0AAN8IACASAADgCAAgEwAA4QgAIBQAAOIIACAVAADjCAAgFgAA5AgAIBgAAOUIACDzAwEAoQcAIfUDAQChBwAhhgRAAKMHACGZBAEAoQcAIaIEIACpBwAhowRAAMAHACGkBEAAowcAIbcEAQChBwAhvAQAAIkIvAQiwwQBAKIHACHJBAEAoQcAIcoEAQChBwAhywQAANsIACDMBAEAogcAIc0EAQCiBwAhzgRAAMAHACHPBCAAqQcAIdAECADcCAAh0QQgAKkHACHSBEAAwAcAIdMEAgCvBwAh1AQCAK8HACHVBAIArwcAIdYECACfCAAh1wRAAMAHACEhCgAAvgkAIAwAAL8JACANAADACQAgEgAAwQkAIBMAAMIJACAVAADECQAgFgAAxQkAIBgAAMYJACDzAwEAAAAB9QMBAAAAAYYEQAAAAAGZBAEAAAABogQgAAAAAaMEQAAAAAGkBEAAAAABtwQBAAAAAbwEAAAAvAQCwwQBAAAAAckEAQAAAAHKBAEAAAABywQAAL0JACDMBAEAAAABzQQBAAAAAc4EQAAAAAHPBCAAAAAB0AQIAAAAAdEEIAAAAAHSBEAAAAAB0wQCAAAAAdQEAgAAAAHVBAIAAAAB1gQIAAAAAdcEQAAAAAECAAAADQAgOAAA4gwAIB4EAADZCwAgBQAA2gsAIAcAANsLACASAADcCwAgEwAA3QsAIBkAAN4LACAaAADfCwAgHgAA4AsAIB8AAOELACAhAADiCwAgIgAA4wsAICQAAOULACAlAADmCwAgJgAA5wsAICgAAOkLACApAADoCwAgKgAA6gsAICsAAOsLACDzAwEAAAAB9AMBAAAAAYQEAQAAAAGGBEAAAAABogQgAAAAAaMEQAAAAAGkBEAAAAABvAQAAAD5BAL2BCAAAAAB9wQBAAAAAfoEAAAA-gQC-wQgAAAAAQIAAACXAQAgOAAA5AwAIAMAAAALACA4AADiDAAgOQAA6AwAICMAAAALACAKAADdCAAgDAAA3ggAIA0AAN8IACASAADgCAAgEwAA4QgAIBUAAOMIACAWAADkCAAgGAAA5QgAIDEAAOgMACDzAwEAoQcAIfUDAQChBwAhhgRAAKMHACGZBAEAoQcAIaIEIACpBwAhowRAAMAHACGkBEAAowcAIbcEAQChBwAhvAQAAIkIvAQiwwQBAKIHACHJBAEAoQcAIcoEAQChBwAhywQAANsIACDMBAEAogcAIc0EAQCiBwAhzgRAAMAHACHPBCAAqQcAIdAECADcCAAh0QQgAKkHACHSBEAAwAcAIdMEAgCvBwAh1AQCAK8HACHVBAIArwcAIdYECACfCAAh1wRAAMAHACEhCgAA3QgAIAwAAN4IACANAADfCAAgEgAA4AgAIBMAAOEIACAVAADjCAAgFgAA5AgAIBgAAOUIACDzAwEAoQcAIfUDAQChBwAhhgRAAKMHACGZBAEAoQcAIaIEIACpBwAhowRAAMAHACGkBEAAowcAIbcEAQChBwAhvAQAAIkIvAQiwwQBAKIHACHJBAEAoQcAIcoEAQChBwAhywQAANsIACDMBAEAogcAIc0EAQCiBwAhzgRAAMAHACHPBCAAqQcAIdAECADcCAAh0QQgAKkHACHSBEAAwAcAIdMEAgCvBwAh1AQCAK8HACHVBAIArwcAIdYECACfCAAh1wRAAMAHACEDAAAAmgEAIDgAAOQMACA5AADrDAAgIAAAAJoBACAEAACMCgAgBQAAjQoAIAcAAI4KACASAACPCgAgEwAAkAoAIBkAAJEKACAaAACSCgAgHgAAkwoAIB8AAJQKACAhAACVCgAgIgAAlgoAICQAAJgKACAlAACZCgAgJgAAmgoAICgAAJwKACApAACbCgAgKgAAnQoAICsAAJ4KACAxAADrDAAg8wMBAKEHACH0AwEAoQcAIYQEAQChBwAhhgRAAKMHACGiBCAAqQcAIaMEQADABwAhpARAAKMHACG8BAAAigr5BCL2BCAAqQcAIfcEAQCiBwAh-gQAAIsK-gQi-wQgAKkHACEeBAAAjAoAIAUAAI0KACAHAACOCgAgEgAAjwoAIBMAAJAKACAZAACRCgAgGgAAkgoAIB4AAJMKACAfAACUCgAgIQAAlQoAICIAAJYKACAkAACYCgAgJQAAmQoAICYAAJoKACAoAACcCgAgKQAAmwoAICoAAJ0KACArAACeCgAg8wMBAKEHACH0AwEAoQcAIYQEAQChBwAhhgRAAKMHACGiBCAAqQcAIaMEQADABwAhpARAAKMHACG8BAAAigr5BCL2BCAAqQcAIfcEAQCiBwAh-gQAAIsK-gQi-wQgAKkHACEhCgAAvgkAIAwAAL8JACANAADACQAgEgAAwQkAIBMAAMIJACAUAADDCQAgFgAAxQkAIBgAAMYJACDzAwEAAAAB9QMBAAAAAYYEQAAAAAGZBAEAAAABogQgAAAAAaMEQAAAAAGkBEAAAAABtwQBAAAAAbwEAAAAvAQCwwQBAAAAAckEAQAAAAHKBAEAAAABywQAAL0JACDMBAEAAAABzQQBAAAAAc4EQAAAAAHPBCAAAAAB0AQIAAAAAdEEIAAAAAHSBEAAAAAB0wQCAAAAAdQEAgAAAAHVBAIAAAAB1gQIAAAAAdcEQAAAAAECAAAADQAgOAAA7AwAIB4EAADZCwAgBQAA2gsAIAcAANsLACASAADcCwAgEwAA3QsAIBkAAN4LACAaAADfCwAgHgAA4AsAIB8AAOELACAhAADiCwAgIgAA4wsAICMAAOQLACAlAADmCwAgJgAA5wsAICgAAOkLACApAADoCwAgKgAA6gsAICsAAOsLACDzAwEAAAAB9AMBAAAAAYQEAQAAAAGGBEAAAAABogQgAAAAAaMEQAAAAAGkBEAAAAABvAQAAAD5BAL2BCAAAAAB9wQBAAAAAfoEAAAA-gQC-wQgAAAAAQIAAACXAQAgOAAA7gwAIAMAAAALACA4AADsDAAgOQAA8gwAICMAAAALACAKAADdCAAgDAAA3ggAIA0AAN8IACASAADgCAAgEwAA4QgAIBQAAOIIACAWAADkCAAgGAAA5QgAIDEAAPIMACDzAwEAoQcAIfUDAQChBwAhhgRAAKMHACGZBAEAoQcAIaIEIACpBwAhowRAAMAHACGkBEAAowcAIbcEAQChBwAhvAQAAIkIvAQiwwQBAKIHACHJBAEAoQcAIcoEAQChBwAhywQAANsIACDMBAEAogcAIc0EAQCiBwAhzgRAAMAHACHPBCAAqQcAIdAECADcCAAh0QQgAKkHACHSBEAAwAcAIdMEAgCvBwAh1AQCAK8HACHVBAIArwcAIdYECACfCAAh1wRAAMAHACEhCgAA3QgAIAwAAN4IACANAADfCAAgEgAA4AgAIBMAAOEIACAUAADiCAAgFgAA5AgAIBgAAOUIACDzAwEAoQcAIfUDAQChBwAhhgRAAKMHACGZBAEAoQcAIaIEIACpBwAhowRAAMAHACGkBEAAowcAIbcEAQChBwAhvAQAAIkIvAQiwwQBAKIHACHJBAEAoQcAIcoEAQChBwAhywQAANsIACDMBAEAogcAIc0EAQCiBwAhzgRAAMAHACHPBCAAqQcAIdAECADcCAAh0QQgAKkHACHSBEAAwAcAIdMEAgCvBwAh1AQCAK8HACHVBAIArwcAIdYECACfCAAh1wRAAMAHACEDAAAAmgEAIDgAAO4MACA5AAD1DAAgIAAAAJoBACAEAACMCgAgBQAAjQoAIAcAAI4KACASAACPCgAgEwAAkAoAIBkAAJEKACAaAACSCgAgHgAAkwoAIB8AAJQKACAhAACVCgAgIgAAlgoAICMAAJcKACAlAACZCgAgJgAAmgoAICgAAJwKACApAACbCgAgKgAAnQoAICsAAJ4KACAxAAD1DAAg8wMBAKEHACH0AwEAoQcAIYQEAQChBwAhhgRAAKMHACGiBCAAqQcAIaMEQADABwAhpARAAKMHACG8BAAAigr5BCL2BCAAqQcAIfcEAQCiBwAh-gQAAIsK-gQi-wQgAKkHACEeBAAAjAoAIAUAAI0KACAHAACOCgAgEgAAjwoAIBMAAJAKACAZAACRCgAgGgAAkgoAIB4AAJMKACAfAACUCgAgIQAAlQoAICIAAJYKACAjAACXCgAgJQAAmQoAICYAAJoKACAoAACcCgAgKQAAmwoAICoAAJ0KACArAACeCgAg8wMBAKEHACH0AwEAoQcAIYQEAQChBwAhhgRAAKMHACGiBCAAqQcAIaMEQADABwAhpARAAKMHACG8BAAAigr5BCL2BCAAqQcAIfcEAQCiBwAh-gQAAIsK-gQi-wQgAKkHACEhCgAAvgkAIAwAAL8JACANAADACQAgEgAAwQkAIBMAAMIJACAUAADDCQAgFQAAxAkAIBgAAMYJACDzAwEAAAAB9QMBAAAAAYYEQAAAAAGZBAEAAAABogQgAAAAAaMEQAAAAAGkBEAAAAABtwQBAAAAAbwEAAAAvAQCwwQBAAAAAckEAQAAAAHKBAEAAAABywQAAL0JACDMBAEAAAABzQQBAAAAAc4EQAAAAAHPBCAAAAAB0AQIAAAAAdEEIAAAAAHSBEAAAAAB0wQCAAAAAdQEAgAAAAHVBAIAAAAB1gQIAAAAAdcEQAAAAAECAAAADQAgOAAA9gwAIAMAAAALACA4AAD2DAAgOQAA-gwAICMAAAALACAKAADdCAAgDAAA3ggAIA0AAN8IACASAADgCAAgEwAA4QgAIBQAAOIIACAVAADjCAAgGAAA5QgAIDEAAPoMACDzAwEAoQcAIfUDAQChBwAhhgRAAKMHACGZBAEAoQcAIaIEIACpBwAhowRAAMAHACGkBEAAowcAIbcEAQChBwAhvAQAAIkIvAQiwwQBAKIHACHJBAEAoQcAIcoEAQChBwAhywQAANsIACDMBAEAogcAIc0EAQCiBwAhzgRAAMAHACHPBCAAqQcAIdAECADcCAAh0QQgAKkHACHSBEAAwAcAIdMEAgCvBwAh1AQCAK8HACHVBAIArwcAIdYECACfCAAh1wRAAMAHACEhCgAA3QgAIAwAAN4IACANAADfCAAgEgAA4AgAIBMAAOEIACAUAADiCAAgFQAA4wgAIBgAAOUIACDzAwEAoQcAIfUDAQChBwAhhgRAAKMHACGZBAEAoQcAIaIEIACpBwAhowRAAMAHACGkBEAAowcAIbcEAQChBwAhvAQAAIkIvAQiwwQBAKIHACHJBAEAoQcAIcoEAQChBwAhywQAANsIACDMBAEAogcAIc0EAQCiBwAhzgRAAMAHACHPBCAAqQcAIdAECADcCAAh0QQgAKkHACHSBEAAwAcAIdMEAgCvBwAh1AQCAK8HACHVBAIArwcAIdYECACfCAAh1wRAAMAHACEeBAAA2QsAIAUAANoLACAHAADbCwAgEgAA3AsAIBMAAN0LACAZAADeCwAgGgAA3wsAIB4AAOALACAfAADhCwAgIQAA4gsAICIAAOMLACAjAADkCwAgJAAA5QsAICUAAOYLACAoAADpCwAgKQAA6AsAICoAAOoLACArAADrCwAg8wMBAAAAAfQDAQAAAAGEBAEAAAABhgRAAAAAAaIEIAAAAAGjBEAAAAABpARAAAAAAbwEAAAA-QQC9gQgAAAAAfcEAQAAAAH6BAAAAPoEAvsEIAAAAAECAAAAlwEAIDgAAPsMACAhCgAAvgkAIAwAAL8JACANAADACQAgEgAAwQkAIBMAAMIJACAUAADDCQAgFQAAxAkAIBYAAMUJACDzAwEAAAAB9QMBAAAAAYYEQAAAAAGZBAEAAAABogQgAAAAAaMEQAAAAAGkBEAAAAABtwQBAAAAAbwEAAAAvAQCwwQBAAAAAckEAQAAAAHKBAEAAAABywQAAL0JACDMBAEAAAABzQQBAAAAAc4EQAAAAAHPBCAAAAAB0AQIAAAAAdEEIAAAAAHSBEAAAAAB0wQCAAAAAdQEAgAAAAHVBAIAAAAB1gQIAAAAAdcEQAAAAAECAAAADQAgOAAA_QwAIAMAAACaAQAgOAAA-wwAIDkAAIENACAgAAAAmgEAIAQAAIwKACAFAACNCgAgBwAAjgoAIBIAAI8KACATAACQCgAgGQAAkQoAIBoAAJIKACAeAACTCgAgHwAAlAoAICEAAJUKACAiAACWCgAgIwAAlwoAICQAAJgKACAlAACZCgAgKAAAnAoAICkAAJsKACAqAACdCgAgKwAAngoAIDEAAIENACDzAwEAoQcAIfQDAQChBwAhhAQBAKEHACGGBEAAowcAIaIEIACpBwAhowRAAMAHACGkBEAAowcAIbwEAACKCvkEIvYEIACpBwAh9wQBAKIHACH6BAAAiwr6BCL7BCAAqQcAIR4EAACMCgAgBQAAjQoAIAcAAI4KACASAACPCgAgEwAAkAoAIBkAAJEKACAaAACSCgAgHgAAkwoAIB8AAJQKACAhAACVCgAgIgAAlgoAICMAAJcKACAkAACYCgAgJQAAmQoAICgAAJwKACApAACbCgAgKgAAnQoAICsAAJ4KACDzAwEAoQcAIfQDAQChBwAhhAQBAKEHACGGBEAAowcAIaIEIACpBwAhowRAAMAHACGkBEAAowcAIbwEAACKCvkEIvYEIACpBwAh9wQBAKIHACH6BAAAiwr6BCL7BCAAqQcAIQMAAAALACA4AAD9DAAgOQAAhA0AICMAAAALACAKAADdCAAgDAAA3ggAIA0AAN8IACASAADgCAAgEwAA4QgAIBQAAOIIACAVAADjCAAgFgAA5AgAIDEAAIQNACDzAwEAoQcAIfUDAQChBwAhhgRAAKMHACGZBAEAoQcAIaIEIACpBwAhowRAAMAHACGkBEAAowcAIbcEAQChBwAhvAQAAIkIvAQiwwQBAKIHACHJBAEAoQcAIcoEAQChBwAhywQAANsIACDMBAEAogcAIc0EAQCiBwAhzgRAAMAHACHPBCAAqQcAIdAECADcCAAh0QQgAKkHACHSBEAAwAcAIdMEAgCvBwAh1AQCAK8HACHVBAIArwcAIdYECACfCAAh1wRAAMAHACEhCgAA3QgAIAwAAN4IACANAADfCAAgEgAA4AgAIBMAAOEIACAUAADiCAAgFQAA4wgAIBYAAOQIACDzAwEAoQcAIfUDAQChBwAhhgRAAKMHACGZBAEAoQcAIaIEIACpBwAhowRAAMAHACGkBEAAowcAIbcEAQChBwAhvAQAAIkIvAQiwwQBAKIHACHJBAEAoQcAIcoEAQChBwAhywQAANsIACDMBAEAogcAIc0EAQCiBwAhzgRAAMAHACHPBCAAqQcAIdAECADcCAAh0QQgAKkHACHSBEAAwAcAIdMEAgCvBwAh1AQCAK8HACHVBAIArwcAIdYECACfCAAh1wRAAMAHACENBgAAgggAIA0AAIEIACAOAACFCAAgEQAAhAgAIPMDAQAAAAGGBEAAAAABoAQBAAAAAaIEIAAAAAGkBEAAAAABtAQBAAAAAbcEAQAAAAG4BAEAAAABuQQgAAAAAQIAAAAdACA4AACFDQAgIQoAAL4JACAMAAC_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-gQC-wQgAAAAAQIAAACXAQAgOAAAqg0AIB4EAADZCwAgBQAA2gsAIAcAANsLACASAADcCwAgEwAA3QsAIBkAAN4LACAaAADfCwAgHgAA4AsAIB8AAOELACAhAADiCwAgIgAA4wsAICMAAOQLACAkAADlCwAgJQAA5gsAICYAAOcLACApAADoCwAgKgAA6gsAICsAAOsLACDzAwEAAAAB9AMBAAAAAYQEAQAAAAGGBEAAAAABogQgAAAAAaMEQAAAAAGkBEAAAAABvAQAAAD5BAL2BCAAAAAB9wQBAAAAAfoEAAAA-gQC-wQgAAAAAQIAAACXAQAgOAAArA0AIAMAAACaAQAgOAAAqg0AIDkAALANACAgAAAAmgEAIAQAAIwKACAFAACNCgAgBwAAjgoAIBIAAI8KACATAACQCgAgGQAAkQoAIBoAAJIKACAeAACTCgAgHwAAlAoAICEAAJUKACAiAACWCgAgIwAAlwoAICQAAJgKACAlAACZCgAgJgAAmgoAICgAAJwKACAqAACdCgAgKwAAngoAIDEAALANACDzAwEAoQcAIfQDAQChBwAhhAQBAKEHACGGBEAAowcAIaIEIACpBwAhowRAAMAHACGkBEAAowcAIbwEAACKCvkEIvYEIACpBwAh9wQBAKIHACH6BAAAiwr6BCL7BCAAqQcAIR4EAACMCgAgBQAAjQoAIAcAAI4KACASAACPCgAgEwAAkAoAIBkAAJEKACAaAACSCgAgHgAAkwoAIB8AAJQKACAhAACVCgAgIgAAlgoAICMAAJcKACAkAACYCgAgJQAAmQoAICYAAJoKACAoAACcCgAgKgAAnQoAICsAAJ4KACDzAwEAoQcAIfQDAQChBwAhhAQBAKEHACGGBEAAowcAIaIEIACpBwAhowRAAMAHACGkBEAAowcAIbwEAACKCvkEIvYEIACpBwAh9wQBAKIHACH6BAAAiwr6BCL7BCAAqQcAIQMAAACaAQAgOAAArA0AIDkAALMNACAgAAAAmgEAIAQAAIwKACAFAACNCgAgBwAAjgoAIBIAAI8KACATAACQCgAgGQAAkQoAIBoAAJIKACAeAACTCgAgHwAAlAoAICEAAJUKACAiAACWCgAgIwAAlwoAICQAAJgKACAlAACZCgAgJgAAmgoAICkAAJsKACAqAACdCgAgKwAAngoAIDEAALMNACDzAwEAoQcAIfQDAQChBwAhhAQBAKEHACGGBEAAowcAIaIEIACpBwAhowRAAMAHACGkBEAAowcAIbwEAACKCvkEIvYEIACpBwAh9wQBAKIHACH6BAAAiwr6BCL7BCAAqQcAIR4EAACMCgAgBQAAjQoAIAcAAI4KACASAACPCgAgEwAAkAoAIBkAAJEKACAaAACSCgAgHgAAkwoAIB8AAJQKACAhAACVCgAgIgAAlgoAICMAAJcKACAkAACYCgAgJQAAmQoAICYAAJoKACApAACbCgAgKgAAnQoAICsAAJ4KACDzAwEAoQcAIfQDAQChBwAhhAQBAKEHACGGBEAAowcAIaIEIACpBwAhowRAAMAHACGkBEAAowcAIbwEAACKCvkEIvYEIACpBwAh9wQBAKIHACH6BAAAiwr6BCL7BCAAqQcAIR4EAADZCwAgBQAA2gsAIAcAANsLACASAADcCwAgEwAA3QsAIBkAAN4LACAaAADfCwAgHgAA4AsAIB8AAOELACAhAADiCwAgIgAA4wsAICMAAOQLACAkAADlCwAgJQAA5gsAICYAAOcLACAoAADpCwAgKQAA6AsAICsAAOsLACDzAwEAAAAB9AMBAAAAAYQEAQAAAAGGBEAAAAABogQgAAAAAaMEQAAAAAGkBEAAAAABvAQAAAD5BAL2BCAAAAAB9wQBAAAAAfoEAAAA-gQC-wQgAAAAAQIAAACXAQAgOAAAtA0AIAMAAACaAQAgOAAAtA0AIDkAALgNACAgAAAAmgEAIAQAAIwKACAFAACNCgAgBwAAjgoAIBIAAI8KACATAACQCgAgGQAAkQoAIBoAAJIKACAeAACTCgAgHwAAlAoAICEAAJUKACAiAACWCgAgIwAAlwoAICQAAJgKACAlAACZCgAgJgAAmgoAICgAAJwKACApAACbCgAgKwAAngoAIDEAALgNACDzAwEAoQcAIfQDAQChBwAhhAQBAKEHACGGBEAAowcAIaIEIACpBwAhowRAAMAHACGkBEAAowcAIbwEAACKCvkEIvYEIACpBwAh9wQBAKIHACH6BAAAiwr6BCL7BCAAqQcAIR4EAACMCgAgBQAAjQoAIAcAAI4KACASAACPCgAgEwAAkAoAIBkAAJEKACAaAACSCgAgHgAAkwoAIB8AAJQKACAhAACVCgAgIgAAlgoAICMAAJcKACAkAACYCgAgJQAAmQoAICYAAJoKACAoAACcCgAgKQAAmwoAICsAAJ4KACDzAwEAoQcAIfQDAQChBwAhhAQBAKEHACGGBEAAowcAIaIEIACpBwAhowRAAMAHACGkBEAAowcAIbwEAACKCvkEIvYEIACpBwAh9wQBAKIHACH6BAAAiwr6BCL7BCAAqQcAIR4EAADZCwAgBQAA2gsAIAcAANsLACASAADcCwAgEwAA3QsAIBkAAN4LACAeAADgCwAgHwAA4QsAICEAAOILACAiAADjCwAgIwAA5AsAICQAAOULACAlAADmCwAgJgAA5wsAICgAAOkLACApAADoCwAgKgAA6gsAICsAAOsLACDzAwEAAAAB9AMBAAAAAYQEAQAAAAGGBEAAAAABogQgAAAAAaMEQAAAAAGkBEAAAAABvAQAAAD5BAL2BCAAAAAB9wQBAAAAAfoEAAAA-gQC-wQgAAAAAQIAAACXAQAgOAAAuQ0AIAMAAACaAQAgOAAAuQ0AIDkAAL0NACAgAAAAmgEAIAQAAIwKACAFAACNCgAgBwAAjgoAIBIAAI8KACATAACQCgAgGQAAkQoAIB4AAJMKACAfAACUCgAgIQAAlQoAICIAAJYKACAjAACXCgAgJAAAmAoAICUAAJkKACAmAACaCgAgKAAAnAoAICkAAJsKACAqAACdCgAgKwAAngoAIDEAAL0NACDzAwEAoQcAIfQDAQChBwAhhAQBAKEHACGGBEAAowcAIaIEIACpBwAhowRAAMAHACGkBEAAowcAIbwEAACKCvkEIvYEIACpBwAh9wQBAKIHACH6BAAAiwr6BCL7BCAAqQcAIR4EAACMCgAgBQAAjQoAIAcAAI4KACASAACPCgAgEwAAkAoAIBkAAJEKACAeAACTCgAgHwAAlAoAICEAAJUKACAiAACWCgAgIwAAlwoAICQAAJgKACAlAACZCgAgJgAAmgoAICgAAJwKACApAACbCgAgKgAAnQoAICsAAJ4KACDzAwEAoQcAIfQDAQChBwAhhAQBAKEHACGGBEAAowcAIaIEIACpBwAhowRAAMAHACGkBEAAowcAIbwEAACKCvkEIvYEIACpBwAh9wQBAKIHACH6BAAAiwr6BCL7BCAAqQcAIR4EAADZCwAgBQAA2gsAIAcAANsLACASAADcCwAgEwAA3QsAIBkAAN4LACAaAADfCwAgHgAA4AsAIB8AAOELACAiAADjCwAgIwAA5AsAICQAAOULACAlAADmCwAgJgAA5wsAICgAAOkLACApAADoCwAgKgAA6gsAICsAAOsLACDzAwEAAAAB9AMBAAAAAYQEAQAAAAGGBEAAAAABogQgAAAAAaMEQAAAAAGkBEAAAAABvAQAAAD5BAL2BCAAAAAB9wQBAAAAAfoEAAAA-gQC-wQgAAAAAQIAAACXAQAgOAAAvg0AIAMAAACaAQAgOAAAvg0AIDkAAMINACAgAAAAmgEAIAQAAIwKACAFAACNCgAgBwAAjgoAIBIAAI8KACATAACQCgAgGQAAkQoAIBoAAJIKACAeAACTCgAgHwAAlAoAICIAAJYKACAjAACXCgAgJAAAmAoAICUAAJkKACAmAACaCgAgKAAAnAoAICkAAJsKACAqAACdCgAgKwAAngoAIDEAAMINACDzAwEAoQcAIfQDAQChBwAhhAQBAKEHACGGBEAAowcAIaIEIACpBwAhowRAAMAHACGkBEAAowcAIbwEAACKCvkEIvYEIACpBwAh9wQBAKIHACH6BAAAiwr6BCL7BCAAqQcAIR4EAACMCgAgBQAAjQoAIAcAAI4KACASAACPCgAgEwAAkAoAIBkAAJEKACAaAACSCgAgHgAAkwoAIB8AAJQKACAiAACWCgAgIwAAlwoAICQAAJgKACAlAACZCgAgJgAAmgoAICgAAJwKACApAACbCgAgKgAAnQoAICsAAJ4KACDzAwEAoQcAIfQDAQChBwAhhAQBAKEHACGGBEAAowcAIaIEIACpBwAhowRAAMAHACGkBEAAowcAIbwEAACKCvkEIvYEIACpBwAh9wQBAKIHACH6BAAAiwr6BCL7BCAAqQcAIR4EAADZCwAgBQAA2gsAIAcAANsLACASAADcCwAgEwAA3QsAIBkAAN4LACAaAADfCwAgHgAA4AsAIB8AAOELACAhAADiCwAgIwAA5AsAICQAAOULACAlAADmCwAgJgAA5wsAICgAAOkLACApAADoCwAgKgAA6gsAICsAAOsLACDzAwEAAAAB9AMBAAAAAYQEAQAAAAGGBEAAAAABogQgAAAAAaMEQAAAAAGkBEAAAAABvAQAAAD5BAL2BCAAAAAB9wQBAAAAAfoEAAAA-gQC-wQgAAAAAQIAAACXAQAgOAAAww0AIAMAAACaAQAgOAAAww0AIDkAAMcNACAgAAAAmgEAIAQAAIwKACAFAACNCgAgBwAAjgoAIBIAAI8KACATAACQCgAgGQAAkQoAIBoAAJIKACAeAACTCgAgHwAAlAoAICEAAJUKACAjAACXCgAgJAAAmAoAICUAAJkKACAmAACaCgAgKAAAnAoAICkAAJsKACAqAACdCgAgKwAAngoAIDEAAMcNACDzAwEAoQcAIfQDAQChBwAhhAQBAKEHACGGBEAAowcAIaIEIACpBwAhowRAAMAHACGkBEAAowcAIbwEAACKCvkEIvYEIACpBwAh9wQBAKIHACH6BAAAiwr6BCL7BCAAqQcAIR4EAACMCgAgBQAAjQoAIAcAAI4KACASAACPCgAgEwAAkAoAIBkAAJEKACAaAACSCgAgHgAAkwoAIB8AAJQKACAhAACVCgAgIwAAlwoAICQAAJgKACAlAACZCgAgJgAAmgoAICgAAJwKACApAACbCgAgKgAAnQoAICsAAJ4KACDzAwEAoQcAIfQDAQChBwAhhAQBAKEHACGGBEAAowcAIaIEIACpBwAhowRAAMAHACGkBEAAowcAIbwEAACKCvkEIvYEIACpBwAh9wQBAKIHACH6BAAAiwr6BCL7BCAAqQcAIR4EAADZCwAgBQAA2gsAIAcAANsLACASAADcCwAgEwAA3QsAIBkAAN4LACAaAADfCwAgHgAA4AsAIB8AAOELACAhAADiCwAgIgAA4wsAICMAAOQLACAkAADlCwAgJgAA5wsAICgAAOkLACApAADoCwAgKgAA6gsAICsAAOsLACDzAwEAAAAB9AMBAAAAAYQEAQAAAAGGBEAAAAABogQgAAAAAaMEQAAAAAGkBEAAAAABvAQAAAD5BAL2BCAAAAAB9wQBAAAAAfoEAAAA-gQC-wQgAAAAAQIAAACXAQAgOAAAyA0AIAMAAACaAQAgOAAAyA0AIDkAAMwNACAgAAAAmgEAIAQAAIwKACAFAACNCgAgBwAAjgoAIBIAAI8KACATAACQCgAgGQAAkQoAIBoAAJIKACAeAACTCgAgHwAAlAoAICEAAJUKACAiAACWCgAgIwAAlwoAICQAAJgKACAmAACaCgAgKAAAnAoAICkAAJsKACAqAACdCgAgKwAAngoAIDEAAMwNACDzAwEAoQcAIfQDAQChBwAhhAQBAKEHACGGBEAAowcAIaIEIACpBwAhowRAAMAHACGkBEAAowcAIbwEAACKCvkEIvYEIACpBwAh9wQBAKIHACH6BAAAiwr6BCL7BCAAqQcAIR4EAACMCgAgBQAAjQoAIAcAAI4KACASAACPCgAgEwAAkAoAIBkAAJEKACAaAACSCgAgHgAAkwoAIB8AAJQKACAhAACVCgAgIgAAlgoAICMAAJcKACAkAACYCgAgJgAAmgoAICgAAJwKACApAACbCgAgKgAAnQoAICsAAJ4KACDzAwEAoQcAIfQDAQChBwAhhAQBAKEHACGGBEAAowcAIaIEIACpBwAhowRAAMAHACGkBEAAowcAIbwEAACKCvkEIvYEIACpBwAh9wQBAKIHACH6BAAAiwr6BCL7BCAAqQcAIQEDAAIUBAYDBQoEBw4FCAAgEkMME0QPGUUNGkkVHk0WH1gXIVwbImAcI2EQJGIRJWYdJmcTKGweKWseKm4fK3ABAQMAAgEDAAIKCAAUChIGDBgJDQACEh4MEyoPFC4QFTIRFjYSGDoTAgYABQkABwIHEwYIAAgBBxQAAgYABQsACgIHGQkIAAsBBxoABgYABQgADg0AAg4fDA8gDBEkDQIDAAIQAAwCDyUAESYAAgMAAgYABQIDAAIGAAUCAwACBgAFAQYABQIGAAUXAAIICjsADDwAEj0AEz4AFD8AFUAAFkEAGEIAAQMAAgMDAAIIABobURcDAwACHFMYHVYWAggAGRtUFwEbVQABG1cAASAAAgEDAAIBAwACAicAAigAAgEDAAIQBHEABXIAB3MAEnQAE3UAGXYAGncAHngAIXkAInoAI3sAJHwAJX0AJn4AKIABACl_AAABAwACAQMAAgMIACU-ACY_ACcAAAADCAAlPgAmPwAnAAADCAAsPgAtPwAuAAAAAwgALD4ALT8ALgEDAAIBAwACAwgAMz4AND8ANQAAAAMIADM-ADQ_ADUBAwACAQMAAgMIADo-ADs_ADwAAAADCAA6PgA7PwA8AAAAAwgAQj4AQz8ARAAAAAMIAEI-AEM_AEQBAwACAQMAAgUIAEk-AEw_AE2QAQBKkQEASwAAAAAABQgAST4ATD8ATZABAEqRAQBLAAAFCABSPgBVPwBWkAEAU5EBAFQAAAAAAAUIAFI-AFU_AFaQAQBTkQEAVAMDAAIcrQIYHa4CFgMDAAIctAIYHbUCFgMIAFs-AFw_AF0AAAADCABbPgBcPwBdAQ0AAgENAAIFCABiPgBlPwBmkAEAY5EBAGQAAAAAAAUIAGI-AGU_AGaQAQBjkQEAZAAAAwgAaz4AbD8AbQAAAAMIAGs-AGw_AG0CBgAFCQAHAgYABQkABwMIAHI-AHM_AHQAAAADCAByPgBzPwB0AAADCAB5PgB6PwB7AAAAAwgAeT4Aej8AewIGAAULAAoCBgAFCwAKAwgAgAE-AIEBPwCCAQAAAAMIAIABPgCBAT8AggECAwACBgAFAgMAAgYABQUIAIcBPgCKAT8AiwGQAQCIAZEBAIkBAAAAAAAFCACHAT4AigE_AIsBkAEAiAGRAQCJAQIDAAIGAAUCAwACBgAFAwgAkAE-AJEBPwCSAQAAAAMIAJABPgCRAT8AkgEBBgAFAQYABQMIAJcBPgCYAT8AmQEAAAADCACXAT4AmAE_AJkBAgYABRcAAgIGAAUXAAIDCACeAT4AnwE_AKABAAAAAwgAngE-AJ8BPwCgAQMGAAUNAAIOkwQMAwYABQ0AAg6ZBAwDCAClAT4ApgE_AKcBAAAAAwgApQE-AKYBPwCnAQIDAAIQAAwCAwACEAAMAwgArAE-AK0BPwCuAQAAAAMIAKwBPgCtAT8ArgECAwACBgAFAgMAAgYABQUIALMBPgC2AT8AtwGQAQC0AZEBALUBAAAAAAAFCACzAT4AtgE_ALcBkAEAtAGRAQC1AQInAAIoAAICJwACKAACAwgAvAE-AL0BPwC-AQAAAAMIALwBPgC9AT8AvgEBAwACAQMAAgUIAMMBPgDGAT8AxwGQAQDEAZEBAMUBAAAAAAAFCADDAT4AxgE_AMcBkAEAxAGRAQDFAQAAAwgAzAE-AM0BPwDOAQAAAAMIAMwBPgDNAT8AzgEBAwACAQMAAgMIANMBPgDUAT8A1QEAAAADCADTAT4A1AE_ANUBASAAAgEgAAIDCADaAT4A2wE_ANwBAAAAAwgA2gE-ANsBPwDcAQEDAAIBAwACBQgA4QE-AOQBPwDlAZABAOIBkQEA4wEAAAAAAAUIAOEBPgDkAT8A5QGQAQDiAZEBAOMBAAAAAwgA6wE-AOwBPwDtAQAAAAMIAOsBPgDsAT8A7QEBAwACAQMAAgMIAPIBPgDzAT8A9AEAAAADCADyAT4A8wE_APQBLAIBLYEBAS6DAQEvhAEBMIUBATKHAQEziQEhNIoBIjWMAQE2jgEhN48BIzqQAQE7kQEBPJIBIUCVASRBlgEoQpgBAkOZAQJEnAECRZ0BAkaeAQJHoAECSKIBIUmjASlKpQECS6cBIUyoASpNqQECTqoBAk-rASFQrgErUa8BL1KwAQRTsQEEVLIBBFWzAQRWtAEEV7YBBFi4ASFZuQEwWrsBBFu9ASFcvgExXb8BBF7AAQRfwQEhYMQBMmHFATZixgEDY8cBA2TIAQNlyQEDZsoBA2fMAQNozgEhac8BN2rRAQNr0wEhbNQBOG3VAQNu1gEDb9cBIXDaATlx2wE9ct0BPnPeAT504QE-deIBPnbjAT535QE-eOcBIXnoAT966gE-e-wBIXztAUB97gE-fu8BPn_wASGAAfMBQYEB9AFFggH1ARaDAfYBFoQB9wEWhQH4ARaGAfkBFocB-wEWiAH9ASGJAf4BRooBgAIWiwGCAiGMAYMCR40BhAIWjgGFAhaPAYYCIZIBiQJIkwGKAk6UAYwCGJUBjQIYlgGPAhiXAZACGJgBkQIYmQGTAhiaAZUCIZsBlgJPnAGYAhidAZoCIZ4BmwJQnwGcAhigAZ0CGKEBngIhogGhAlGjAaICV6QBowIXpQGkAhemAaUCF6cBpgIXqAGnAhepAakCF6oBqwIhqwGsAlisAbACF60BsgIhrgGzAlmvAbYCF7ABtwIXsQG4AiGyAbsCWrMBvAJetAG9AgW1Ab4CBbYBvwIFtwHAAgW4AcECBbkBwwIFugHFAiG7AcYCX7wByAIFvQHKAiG-AcsCYL8BzAIFwAHNAgXBAc4CIcIB0QJhwwHSAmfEAdQCB8UB1QIHxgHYAgfHAdkCB8gB2gIHyQHcAgfKAd4CIcsB3wJozAHhAgfNAeMCIc4B5AJpzwHlAgfQAeYCB9EB5wIh0gHqAmrTAesCbtQB7AIG1QHtAgbWAe4CBtcB7wIG2AHwAgbZAfICBtoB9AIh2wH1Am_cAfcCBt0B-QIh3gH6AnDfAfsCBuAB_AIG4QH9AiHiAYADceMBgQN15AGDAwrlAYQDCuYBhwMK5wGIAwroAYkDCukBiwMK6gGNAyHrAY4DduwBkAMK7QGSAyHuAZMDd-8BlAMK8AGVAwrxAZYDIfIBmQN48wGaA3z0AZsDCfUBnAMJ9gGdAwn3AZ4DCfgBnwMJ-QGhAwn6AaMDIfsBpAN9_AGmAwn9AagDIf4BqQN-_wGqAwmAAqsDCYECrAMhggKvA3-DArADgwGEArEDEIUCsgMQhgKzAxCHArQDEIgCtQMQiQK3AxCKArkDIYsCugOEAYwCvAMQjQK-AyGOAr8DhQGPAsADEJACwQMQkQLCAyGSAsUDhgGTAsYDjAGUAscDEZUCyAMRlgLJAxGXAsoDEZgCywMRmQLNAxGaAs8DIZsC0AONAZwC0gMRnQLUAyGeAtUDjgGfAtYDEaAC1wMRoQLYAyGiAtsDjwGjAtwDkwGkAt0DEqUC3gMSpgLfAxKnAuADEqgC4QMSqQLjAxKqAuUDIasC5gOUAawC6AMSrQLqAyGuAusDlQGvAuwDErAC7QMSsQLuAyGyAvEDlgGzAvIDmgG0AvMDE7UC9AMTtgL1AxO3AvYDE7gC9wMTuQL5AxO6AvsDIbsC_AObAbwC_gMTvQKABCG-AoEEnAG_AoIEE8ACgwQTwQKEBCHCAocEnQHDAogEoQHEAokEDMUCigQMxgKLBAzHAowEDMgCjQQMyQKPBAzKApEEIcsCkgSiAcwClQQMzQKXBCHOApgEowHPApoEDNACmwQM0QKcBCHSAp8EpAHTAqAEqAHUAqEEDdUCogQN1gKjBA3XAqQEDdgCpQQN2QKnBA3aAqkEIdsCqgSpAdwCrAQN3QKuBCHeAq8EqgHfArAEDeACsQQN4QKyBCHiArUEqwHjArYErwHkArcED-UCuAQP5gK5BA_nAroED-gCuwQP6QK9BA_qAr8EIesCwASwAewCwgQP7QLEBCHuAsUEsQHvAsYED_ACxwQP8QLIBCHyAssEsgHzAswEuAH0As0EHvUCzgQe9gLPBB73AtAEHvgC0QQe-QLTBB76AtUEIfsC1gS5AfwC2AQe_QLaBCH-AtsEugH_AtwEHoAD3QQegQPeBCGCA-EEuwGDA-IEvwGEA-QEH4UD5QQfhgPnBB-HA-gEH4gD6QQfiQPrBB-KA-0EIYsD7gTAAYwD8AQfjQPyBCGOA_MEwQGPA_QEH5AD9QQfkQP2BCGSA_kEwgGTA_oEyAGUA_wEyQGVA_0EyQGWA4AFyQGXA4EFyQGYA4IFyQGZA4QFyQGaA4YFIZsDhwXKAZwDiAXJAZ0DiQUhngOMBcsBnwONBc8BoAOOBRWhA48FFaIDkAUVowORBRWkA5IFFaUDlAUVpgOWBSGnA5cF0AGoA5kFFakDmwUhqgOcBdEBqwOdBRWsA54FFa0DnwUhrgOiBdIBrwOjBdYBsAOkBRuxA6UFG7IDpgUbswOnBRu0A6gFG7UDqgUbtgOsBSG3A60F1wG4A68FG7kDsQUhugOyBdgBuwOzBRu8A7QFG70DtQUhvgO4BdkBvwO5Bd0BwAO6BRzBA7sFHMIDvAUcwwO9BRzEA74FHMUDwAUcxgPCBSHHA8MF3gHIA8UFHMkDxwUhygPIBd8BywPJBRzMA8oFHM0DywUhzgPOBeABzwPPBeYB0APRBecB0QPSBecB0gPVBecB0wPWBecB1APXBecB1QPZBecB1gPbBSHXA9wF6AHYA94F5wHZA-AFIdoD4QXpAdsD4gXnAdwD4wXnAd0D5AUh3gPnBeoB3wPoBe4B4APpBR3hA-oFHeID6wUd4wPsBR3kA-0FHeUD7wUd5gPxBSHnA_IF7wHoA_QFHekD9gUh6gP3BfAB6wP4BR3sA_kFHe0D-gUh7gP9BfEB7wP-BfUB"
};
async function decodeBase64AsWasm(wasmBase64) {
  const { Buffer: Buffer2 } = await import("buffer");
  const wasmArray = Buffer2.from(wasmBase64, "base64");
  return new WebAssembly.Module(wasmArray);
}
config.compilerWasm = {
  getRuntime: async () => await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.mjs"),
  getQueryCompilerWasmModule: async () => {
    const { wasm } = await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.wasm-base64.mjs");
    return await decodeBase64AsWasm(wasm);
  },
  importName: "./query_compiler_fast_bg.js"
};
function getPrismaClientClass() {
  return runtime.getPrismaClient(config);
}

// src/generated/prisma/internal/prismaNamespace.ts
var prismaNamespace_exports = {};
__export(prismaNamespace_exports, {
  AccountScalarFieldEnum: () => AccountScalarFieldEnum,
  AchievementScalarFieldEnum: () => AchievementScalarFieldEnum,
  AdminScalarFieldEnum: () => AdminScalarFieldEnum,
  AnyNull: () => AnyNull2,
  AttachmentScalarFieldEnum: () => AttachmentScalarFieldEnum,
  AuditLogScalarFieldEnum: () => AuditLogScalarFieldEnum,
  CategoryScalarFieldEnum: () => CategoryScalarFieldEnum,
  CommentReactionScalarFieldEnum: () => CommentReactionScalarFieldEnum,
  CommentScalarFieldEnum: () => CommentScalarFieldEnum,
  DbNull: () => DbNull2,
  Decimal: () => Decimal2,
  DocumentEmbeddingScalarFieldEnum: () => DocumentEmbeddingScalarFieldEnum,
  FollowScalarFieldEnum: () => FollowScalarFieldEnum,
  IdeaCategoryScalarFieldEnum: () => IdeaCategoryScalarFieldEnum,
  IdeaPurchaseScalarFieldEnum: () => IdeaPurchaseScalarFieldEnum,
  IdeaReviewScalarFieldEnum: () => IdeaReviewScalarFieldEnum,
  IdeaScalarFieldEnum: () => IdeaScalarFieldEnum,
  IdeaTagScalarFieldEnum: () => IdeaTagScalarFieldEnum,
  JsonNull: () => JsonNull2,
  JsonNullValueFilter: () => JsonNullValueFilter,
  ModelName: () => ModelName,
  ModeratorScalarFieldEnum: () => ModeratorScalarFieldEnum,
  NewsletterScalarFieldEnum: () => NewsletterScalarFieldEnum,
  NotificationScalarFieldEnum: () => NotificationScalarFieldEnum,
  NullTypes: () => NullTypes2,
  NullableJsonNullValueInput: () => NullableJsonNullValueInput,
  NullsOrder: () => NullsOrder,
  PaymentScalarFieldEnum: () => PaymentScalarFieldEnum,
  PrismaClientInitializationError: () => PrismaClientInitializationError2,
  PrismaClientKnownRequestError: () => PrismaClientKnownRequestError2,
  PrismaClientRustPanicError: () => PrismaClientRustPanicError2,
  PrismaClientUnknownRequestError: () => PrismaClientUnknownRequestError2,
  PrismaClientValidationError: () => PrismaClientValidationError2,
  QueryMode: () => QueryMode,
  SearchHistoryScalarFieldEnum: () => SearchHistoryScalarFieldEnum,
  SessionScalarFieldEnum: () => SessionScalarFieldEnum,
  SortOrder: () => SortOrder,
  Sql: () => Sql2,
  SubscriptionPlanScalarFieldEnum: () => SubscriptionPlanScalarFieldEnum,
  SubscriptionScalarFieldEnum: () => SubscriptionScalarFieldEnum,
  TagScalarFieldEnum: () => TagScalarFieldEnum,
  TransactionIsolationLevel: () => TransactionIsolationLevel,
  UserScalarFieldEnum: () => UserScalarFieldEnum,
  VerificationScalarFieldEnum: () => VerificationScalarFieldEnum,
  VoteScalarFieldEnum: () => VoteScalarFieldEnum,
  WatchlistScalarFieldEnum: () => WatchlistScalarFieldEnum,
  defineExtension: () => defineExtension,
  empty: () => empty2,
  getExtensionContext: () => getExtensionContext,
  join: () => join2,
  prismaVersion: () => prismaVersion,
  raw: () => raw2,
  sql: () => sql
});
import * as runtime2 from "@prisma/client/runtime/client";
var PrismaClientKnownRequestError2 = runtime2.PrismaClientKnownRequestError;
var PrismaClientUnknownRequestError2 = runtime2.PrismaClientUnknownRequestError;
var PrismaClientRustPanicError2 = runtime2.PrismaClientRustPanicError;
var PrismaClientInitializationError2 = runtime2.PrismaClientInitializationError;
var PrismaClientValidationError2 = runtime2.PrismaClientValidationError;
var sql = runtime2.sqltag;
var empty2 = runtime2.empty;
var join2 = runtime2.join;
var raw2 = runtime2.raw;
var Sql2 = runtime2.Sql;
var Decimal2 = runtime2.Decimal;
var getExtensionContext = runtime2.Extensions.getExtensionContext;
var prismaVersion = {
  client: "7.5.0",
  engine: "280c870be64f457428992c43c1f6d557fab6e29e"
};
var NullTypes2 = {
  DbNull: runtime2.NullTypes.DbNull,
  JsonNull: runtime2.NullTypes.JsonNull,
  AnyNull: runtime2.NullTypes.AnyNull
};
var DbNull2 = runtime2.DbNull;
var JsonNull2 = runtime2.JsonNull;
var AnyNull2 = runtime2.AnyNull;
var ModelName = {
  Admin: "Admin",
  User: "User",
  Session: "Session",
  Account: "Account",
  Verification: "Verification",
  Payment: "Payment",
  SubscriptionPlan: "SubscriptionPlan",
  Subscription: "Subscription",
  Idea: "Idea",
  Category: "Category",
  IdeaCategory: "IdeaCategory",
  Tag: "Tag",
  IdeaTag: "IdeaTag",
  IdeaPurchase: "IdeaPurchase",
  Watchlist: "Watchlist",
  Attachment: "Attachment",
  IdeaReview: "IdeaReview",
  Comment: "Comment",
  CommentReaction: "CommentReaction",
  Vote: "Vote",
  Follow: "Follow",
  Moderator: "Moderator",
  DocumentEmbedding: "DocumentEmbedding",
  Notification: "Notification",
  AuditLog: "AuditLog",
  SearchHistory: "SearchHistory",
  Newsletter: "Newsletter",
  Achievement: "Achievement"
};
var TransactionIsolationLevel = runtime2.makeStrictEnum({
  ReadUncommitted: "ReadUncommitted",
  ReadCommitted: "ReadCommitted",
  RepeatableRead: "RepeatableRead",
  Serializable: "Serializable"
});
var AdminScalarFieldEnum = {
  id: "id",
  name: "name",
  email: "email",
  profilePhoto: "profilePhoto",
  contactNumber: "contactNumber",
  isDeleted: "isDeleted",
  deletedAt: "deletedAt",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  userId: "userId"
};
var UserScalarFieldEnum = {
  id: "id",
  email: "email",
  name: "name",
  emailVerified: "emailVerified",
  image: "image",
  isDeleted: "isDeleted",
  deletedAt: "deletedAt",
  status: "status",
  role: "role",
  needPasswordChange: "needPasswordChange",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var SessionScalarFieldEnum = {
  id: "id",
  expiresAt: "expiresAt",
  token: "token",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  ipAddress: "ipAddress",
  userAgent: "userAgent",
  userId: "userId"
};
var AccountScalarFieldEnum = {
  id: "id",
  accountId: "accountId",
  providerId: "providerId",
  userId: "userId",
  accessToken: "accessToken",
  refreshToken: "refreshToken",
  idToken: "idToken",
  accessTokenExpiresAt: "accessTokenExpiresAt",
  refreshTokenExpiresAt: "refreshTokenExpiresAt",
  scope: "scope",
  password: "password",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var VerificationScalarFieldEnum = {
  id: "id",
  identifier: "identifier",
  value: "value",
  expiresAt: "expiresAt",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var PaymentScalarFieldEnum = {
  id: "id",
  amount: "amount",
  status: "status",
  transactionId: "transactionId",
  paymentMethod: "paymentMethod",
  userId: "userId",
  paymentGatewayData: "paymentGatewayData",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var SubscriptionPlanScalarFieldEnum = {
  id: "id",
  name: "name",
  description: "description",
  tier: "tier",
  price: "price",
  durationDays: "durationDays",
  features: "features",
  order: "order",
  isPopular: "isPopular",
  buttonText: "buttonText",
  isActive: "isActive",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var SubscriptionScalarFieldEnum = {
  id: "id",
  tier: "tier",
  userId: "userId",
  startDate: "startDate",
  endDate: "endDate",
  isActive: "isActive",
  autoRenew: "autoRenew",
  subscriptionPlanId: "subscriptionPlanId",
  paymentId: "paymentId",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var IdeaScalarFieldEnum = {
  id: "id",
  title: "title",
  slug: "slug",
  description: "description",
  problemStatement: "problemStatement",
  proposedSolution: "proposedSolution",
  images: "images",
  authorId: "authorId",
  status: "status",
  adminFeedback: "adminFeedback",
  reviewedBy: "reviewedBy",
  reviewedAt: "reviewedAt",
  isPaid: "isPaid",
  price: "price",
  isFeatured: "isFeatured",
  featuredAt: "featuredAt",
  viewCount: "viewCount",
  upvoteCount: "upvoteCount",
  downvoteCount: "downvoteCount",
  trendingScore: "trendingScore",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  publishedAt: "publishedAt",
  isDeleted: "isDeleted",
  deletedAt: "deletedAt"
};
var CategoryScalarFieldEnum = {
  id: "id",
  name: "name",
  slug: "slug",
  description: "description",
  icon: "icon",
  color: "color",
  isActive: "isActive",
  isDeleted: "isDeleted",
  deletedAt: "deletedAt",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var IdeaCategoryScalarFieldEnum = {
  ideaId: "ideaId",
  categoryId: "categoryId",
  assignedAt: "assignedAt"
};
var TagScalarFieldEnum = {
  id: "id",
  name: "name",
  slug: "slug",
  isDeleted: "isDeleted",
  deletedAt: "deletedAt",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var IdeaTagScalarFieldEnum = {
  ideaId: "ideaId",
  tagId: "tagId",
  assignedAt: "assignedAt"
};
var IdeaPurchaseScalarFieldEnum = {
  id: "id",
  userId: "userId",
  ideaId: "ideaId",
  amount: "amount",
  paymentId: "paymentId",
  purchasedAt: "purchasedAt"
};
var WatchlistScalarFieldEnum = {
  id: "id",
  userId: "userId",
  ideaId: "ideaId",
  isDeleted: "isDeleted",
  deletedAt: "deletedAt",
  createdAt: "createdAt"
};
var AttachmentScalarFieldEnum = {
  id: "id",
  type: "type",
  url: "url",
  title: "title",
  ideaId: "ideaId",
  createdAt: "createdAt"
};
var IdeaReviewScalarFieldEnum = {
  id: "id",
  ideaId: "ideaId",
  reviewerId: "reviewerId",
  status: "status",
  feedback: "feedback",
  isDeleted: "isDeleted",
  deletedAt: "deletedAt",
  createdAt: "createdAt"
};
var CommentScalarFieldEnum = {
  id: "id",
  content: "content",
  authorId: "authorId",
  ideaId: "ideaId",
  parentId: "parentId",
  isDeleted: "isDeleted",
  isFlagged: "isFlagged",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var CommentReactionScalarFieldEnum = {
  userId: "userId",
  commentId: "commentId",
  type: "type",
  createdAt: "createdAt"
};
var VoteScalarFieldEnum = {
  id: "id",
  value: "value",
  userId: "userId",
  ideaId: "ideaId",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var FollowScalarFieldEnum = {
  followerId: "followerId",
  followingId: "followingId",
  createdAt: "createdAt"
};
var ModeratorScalarFieldEnum = {
  id: "id",
  name: "name",
  email: "email",
  profilePhoto: "profilePhoto",
  contactNumber: "contactNumber",
  bio: "bio",
  address: "address",
  phoneNumber: "phoneNumber",
  reputationScore: "reputationScore",
  socialLinks: "socialLinks",
  onboarded: "onboarded",
  activityScore: "activityScore",
  isActive: "isActive",
  assignNotes: "assignNotes",
  assignedAt: "assignedAt",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  isDeleted: "isDeleted",
  deletedAt: "deletedAt",
  userId: "userId"
};
var DocumentEmbeddingScalarFieldEnum = {
  id: "id",
  chunkKey: "chunkKey",
  sourceType: "sourceType",
  sourceId: "sourceId",
  sourceLabel: "sourceLabel",
  content: "content",
  metadata: "metadata",
  isDeleted: "isDeleted",
  deletedAt: "deletedAt",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var NotificationScalarFieldEnum = {
  id: "id",
  type: "type",
  title: "title",
  message: "message",
  isRead: "isRead",
  data: "data",
  userId: "userId",
  createdAt: "createdAt"
};
var AuditLogScalarFieldEnum = {
  id: "id",
  action: "action",
  resource: "resource",
  resourceId: "resourceId",
  actorId: "actorId",
  previousState: "previousState",
  newState: "newState",
  ipAddress: "ipAddress",
  userAgent: "userAgent",
  createdAt: "createdAt"
};
var SearchHistoryScalarFieldEnum = {
  id: "id",
  query: "query",
  resultsCount: "resultsCount",
  userId: "userId",
  createdAt: "createdAt"
};
var NewsletterScalarFieldEnum = {
  id: "id",
  email: "email",
  isSubscribed: "isSubscribed",
  createdAt: "createdAt"
};
var AchievementScalarFieldEnum = {
  id: "id",
  name: "name",
  description: "description",
  icon: "icon",
  userId: "userId",
  earnedAt: "earnedAt"
};
var SortOrder = {
  asc: "asc",
  desc: "desc"
};
var NullableJsonNullValueInput = {
  DbNull: DbNull2,
  JsonNull: JsonNull2
};
var QueryMode = {
  default: "default",
  insensitive: "insensitive"
};
var NullsOrder = {
  first: "first",
  last: "last"
};
var JsonNullValueFilter = {
  DbNull: DbNull2,
  JsonNull: JsonNull2,
  AnyNull: AnyNull2
};
var defineExtension = runtime2.Extensions.defineExtension;

// src/generated/prisma/client.ts
globalThis["__dirname"] = path2.dirname(fileURLToPath(import.meta.url));
var PrismaClient = getPrismaClientClass();

// src/app/lib/prisma.ts
var connectionString = process.env.DATABASE_URL;
var adapter = new PrismaPg({ connectionString });
var prisma = new PrismaClient({ adapter });

// src/app/lib/auth.ts
var connectionString2 = process.env.DATABASE_URL;
var auth = betterAuth({
  baseURL: envVars.BETTER_AUTH_URL,
  secret: envVars.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, {
    provider: "postgresql"
    // or "mysql", "postgresql", ...etc
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true
  },
  socialProviders: {
    google: {
      clientId: envVars.GOOGLE_CLIENT_ID,
      clientSecret: envVars.GOOGLE_CLIENT_SECRET,
      // callbackUrl: envVars.GOOGLE_CALLBACK_URL,
      mapProfileToUser: () => {
        return {
          role: Role.MEMBER,
          status: UserStatus.ACTIVE,
          needPasswordChange: false,
          emailVerified: true,
          isDeleted: false,
          deletedAt: null
        };
      }
    }
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: Role.MEMBER
      },
      status: {
        type: "string",
        required: true,
        defaultValue: UserStatus.ACTIVE
      },
      needPasswordChange: {
        type: "boolean",
        required: true,
        defaultValue: false
      },
      isDeleted: {
        type: "boolean",
        required: true,
        defaultValue: false
      },
      deletedAt: {
        type: "date",
        required: false,
        defaultValue: null
      }
    }
  },
  plugins: [
    bearer(),
    emailOTP({
      overrideDefaultEmailVerification: true,
      async sendVerificationOTP({ email, otp, type, user }) {
        const dbUser = user || await prisma.user.findUnique({ where: { email } });
        if (!dbUser) {
          console.error(`User ${email} not found.`);
          return;
        }
        if (dbUser.role === Role.SUPER_ADMIN) return;
        if (type === "email-verification") {
          await sendEmail({
            to: email,
            subject: "Verify your email",
            templateName: "otp",
            templateData: {
              name: dbUser.name,
              otp
            }
          });
        } else if (type === "forget-password") {
          await sendEmail({
            to: email,
            subject: "Password Reset OTP",
            templateName: "otp",
            templateData: {
              name: dbUser.name,
              otp
            }
          });
        }
      },
      expiresIn: 120,
      // 2 minutes
      otpLength: 6
    })
    // emailOTP({
    //     overrideDefaultEmailVerification: true,
    //     async sendVerificationOTP({ email, otp, type }) {
    //         if (type === "email-verification") {
    //             const user = await prisma.user.findUnique({
    //                 where: {
    //                     email,
    //                 }
    //             })
    //             if (!user) {
    //                 console.error(`User with email ${email} not found. Cannot send verification OTP.`);
    //                 return;
    //             }
    //             if (user && user.role === Role.SUPER_ADMIN) {
    //                 console.log(`User with email ${email} is a super admin. Skipping sending verification OTP.`);
    //                 return;
    //             }
    //             if (user && !user.emailVerified) {
    //                 sendEmail({
    //                     to: email,
    //                     subject: "Verify your email",
    //                     templateName: "otp",
    //                     templateData: {
    //                         name: user.name,
    //                         otp,
    //                     }
    //                 })
    //             }
    //         } else if (type === "forget-password") {
    //             const user = await prisma.user.findUnique({
    //                 where: {
    //                     email,
    //                 }
    //             })
    //             if (user) {
    //                 sendEmail({
    //                     to: email,
    //                     subject: "Password Reset OTP",
    //                     templateName: "otp",
    //                     templateData: {
    //                         name: user.name,
    //                         otp,
    //                     }
    //                 })
    //             }
    //         }
    //     },
    //     expiresIn: 2 * 60, // 2 minutes in seconds
    //     otpLength: 6,
    // })
  ],
  session: {
    expiresIn: 60 * 60 * 60 * 24,
    // 1 day in seconds
    updateAge: 60 * 60 * 60 * 24,
    // 1 day in seconds
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 60 * 24
      // 1 day in seconds
    }
  },
  redirectURLs: {
    signIn: `${envVars.BETTER_AUTH_URL}/api/v1/auth/google/success`
  },
  trustedOrigins: [process.env.BETTER_AUTH_URL || "https://ecovault-server.vercel.app", "http://localhost:5000", "https://ecovault-client.vercel.app", envVars.FRONTEND_URL],
  advanced: {
    disableCSRFCheck: true,
    cookiePrefix: "better-auth",
    useSecureCookies: false,
    crossSubDomainCookies: {
      enabled: false
    },
    cookies: {
      state: {
        attributes: {
          sameSite: "none",
          secure: true,
          httpOnly: true,
          path: "/"
        }
      },
      sessionToken: {
        attributes: {
          sameSite: "none",
          secure: true,
          httpOnly: true,
          path: "/"
        }
      }
    }
  }
});

// src/app.ts
import path3 from "path";
import qs from "qs";

// src/app/routes/index.ts
import { Router as Router16 } from "express";

// src/app/module/auth/auth.route.ts
import { Router } from "express";

// src/app/shared/catchAsync.ts
var catchAsync = (fn) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};

// src/app/module/auth/auth.service.ts
import status3 from "http-status";

// src/app/utils/cookie.ts
var setCookie = (res, key, value, options) => {
  res.cookie(key, value, options);
};
var getCookie = (req, key) => {
  return req.cookies[key];
};
var clearCookie = (res, key, options) => {
  res.clearCookie(key, options);
};
var CookieUtils = {
  setCookie,
  getCookie,
  clearCookie
};

// src/app/utils/jwt.ts
import jwt from "jsonwebtoken";
var createToken = (payload, secret, options) => {
  const token = jwt.sign(payload, secret, options);
  return token;
};
var verifyToken = (token, secret) => {
  try {
    const decoded = jwt.verify(token, secret);
    return {
      success: true,
      data: decoded
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
      error
    };
  }
};
var decodeToken = (token) => {
  const decoded = jwt.decode(token);
  return decoded;
};
var jwtUtils = {
  createToken,
  verifyToken,
  decodeToken
};

// src/app/utils/token.ts
var getAccessToken = (payload) => {
  const accessToken = jwtUtils.createToken(
    payload,
    envVars.ACCESS_TOKEN_SECRET,
    { expiresIn: envVars.ACCESS_TOKEN_EXPIRES_IN }
  );
  return accessToken;
};
var getRefreshToken = (payload) => {
  const refreshToken = jwtUtils.createToken(
    payload,
    envVars.REFRESH_TOKEN_SECRET,
    { expiresIn: envVars.REFRESH_TOKEN_EXPIRES_IN }
  );
  return refreshToken;
};
var setAccessTokenCookie = (res, token) => {
  CookieUtils.setCookie(res, "accessToken", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    //1 day
    maxAge: 60 * 60 * 60 * 24
  });
};
var setRefreshTokenCookie = (res, token) => {
  CookieUtils.setCookie(res, "refreshToken", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    //7d
    maxAge: 60 * 60 * 60 * 24 * 7
  });
};
var setBetterAuthSessionCookie = (res, token) => {
  CookieUtils.setCookie(res, "better-auth.session_token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    //1 day
    maxAge: 60 * 60 * 60 * 24
  });
};
var tokenUtils = {
  getAccessToken,
  getRefreshToken,
  setAccessTokenCookie,
  setRefreshTokenCookie,
  setBetterAuthSessionCookie
};

// src/app/module/auth/auth.service.ts
var registerUser = async (payload) => {
  const { name, email, password, isModerator, profileData } = payload;
  const isUserExists = await prisma.user.findUnique({
    where: {
      email
    }
  });
  if (isUserExists) {
    throw new AppError_default(status3.BAD_REQUEST, "User already exists");
  }
  const data = await auth.api.signUpEmail({
    body: {
      name,
      email,
      password,
      role: isModerator ? Role.MODERATOR : Role.MEMBER
    }
  });
  if (!data.user) {
    throw new AppError_default(status3.BAD_REQUEST, "Failed to register user");
  }
  const isModeratorRegistration = isModerator && profileData;
  try {
    if (isModeratorRegistration) {
      const moderator = await prisma.$transaction(async (tx) => {
        const moderatorTx = await tx.moderator.create({
          data: {
            userId: data.user.id,
            name: payload.name,
            email: payload.email,
            profilePhoto: profileData?.profilePhoto || null,
            contactNumber: profileData?.contactNumber || null,
            bio: profileData?.bio || null,
            address: profileData?.address || null,
            phoneNumber: profileData?.phoneNumber || null,
            reputationScore: profileData?.reputationScore || 0,
            socialLinks: profileData?.socialLinks || null,
            onboarded: false,
            activityScore: 0,
            isActive: false,
            assignNotes: profileData?.assignNotes || null
          }
        });
        return moderatorTx;
      });
      await prisma.user.update({
        where: { id: data.user.id },
        data: { role: Role.MODERATOR }
      });
      const accessToken = tokenUtils.getAccessToken({
        userId: data.user.id,
        role: Role.MODERATOR,
        name: data.user.name,
        email: data.user.email,
        status: data.user.status,
        isDeleted: data.user.isDeleted,
        emailVerified: data.user.emailVerified
      });
      const refreshToken = tokenUtils.getRefreshToken({
        userId: data.user.id,
        role: Role.MODERATOR,
        name: data.user.name,
        email: data.user.email,
        status: data.user.status,
        isDeleted: data.user.isDeleted,
        emailVerified: data.user.emailVerified
      });
      return {
        ...data,
        accessToken,
        refreshToken,
        moderator,
        role: Role.MODERATOR
      };
    } else {
      const accessToken = tokenUtils.getAccessToken({
        userId: data.user.id,
        role: data.user.role,
        name: data.user.name,
        email: data.user.email,
        status: data.user.status,
        isDeleted: data.user.isDeleted,
        emailVerified: data.user.emailVerified
      });
      const refreshToken = tokenUtils.getRefreshToken({
        userId: data.user.id,
        role: data.user.role,
        name: data.user.name,
        email: data.user.email,
        status: data.user.status,
        isDeleted: data.user.isDeleted,
        emailVerified: data.user.emailVerified
      });
      return {
        ...data,
        accessToken,
        refreshToken
      };
    }
  } catch (error) {
    console.log("Transaction error : ", error);
    await prisma.user.delete({
      where: {
        id: data.user.id
      }
    });
    throw error;
  }
};
var loginUser = async (payload) => {
  const { email, password } = payload;
  const data = await auth.api.signInEmail({
    body: {
      email,
      password
    }
  });
  if (data.user.status === UserStatus.BLOCKED) {
    throw new AppError_default(status3.FORBIDDEN, "User is blocked");
  }
  if (data.user.isDeleted || data.user.status === UserStatus.DELETED) {
    throw new AppError_default(status3.NOT_FOUND, "User is deleted");
  }
  const accessToken = tokenUtils.getAccessToken({
    userId: data.user.id,
    role: data.user.role,
    name: data.user.name,
    email: data.user.email,
    status: data.user.status,
    isDeleted: data.user.isDeleted,
    emailVerified: data.user.emailVerified
  });
  const refreshToken = tokenUtils.getRefreshToken({
    userId: data.user.id,
    role: data.user.role,
    name: data.user.name,
    email: data.user.email,
    status: data.user.status,
    isDeleted: data.user.isDeleted,
    emailVerified: data.user.emailVerified
  });
  return {
    ...data,
    accessToken,
    refreshToken
  };
};
var logoutUser = async (sessionToken) => {
  const result = await auth.api.signOut({
    headers: new Headers({
      Authorization: `Bearer ${sessionToken}`
    })
  });
  return result;
};
var getMe = async (user) => {
  const isUserExists = await prisma.user.findUnique({
    where: {
      id: user.userId
    },
    include: {
      admin: true
    }
  });
  if (!isUserExists) {
    throw new AppError_default(status3.NOT_FOUND, "User not found");
  }
  return isUserExists;
};
var getNewToken = async (refreshToken, sessionToken) => {
  const isSessionTokenExists = await prisma.session.findUnique({
    where: {
      token: sessionToken
    },
    include: {
      user: true
    }
  });
  if (!isSessionTokenExists) {
    throw new AppError_default(status3.UNAUTHORIZED, "Invalid session token");
  }
  const verifiedRefreshToken = jwtUtils.verifyToken(refreshToken, envVars.REFRESH_TOKEN_SECRET);
  if (!verifiedRefreshToken.success && verifiedRefreshToken.error) {
    throw new AppError_default(status3.UNAUTHORIZED, "Invalid refresh token");
  }
  const data = verifiedRefreshToken.data;
  const newAccessToken = tokenUtils.getAccessToken({
    userId: data.userId,
    role: data.role,
    name: data.name,
    email: data.email,
    status: data.status,
    isDeleted: data.isDeleted,
    emailVerified: data.emailVerified
  });
  const newRefreshToken = tokenUtils.getRefreshToken({
    userId: data.userId,
    role: data.role,
    name: data.name,
    email: data.email,
    status: data.status,
    isDeleted: data.isDeleted,
    emailVerified: data.emailVerified
  });
  const { token } = await prisma.session.update({
    where: {
      token: sessionToken
    },
    data: {
      token: sessionToken,
      expiresAt: new Date(Date.now() + 60 * 60 * 60 * 24 * 1e3),
      updatedAt: /* @__PURE__ */ new Date()
    }
  });
  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    sessionToken: token
  };
};
var changePassword = async (payload, sessionToken) => {
  const session = await auth.api.getSession({
    headers: new Headers({
      Authorization: `Bearer ${sessionToken}`
    })
  });
  if (!session) {
    throw new AppError_default(status3.UNAUTHORIZED, "Invalid session token");
  }
  const { currentPassword, newPassword } = payload;
  const result = await auth.api.changePassword({
    body: {
      currentPassword,
      newPassword,
      revokeOtherSessions: true
    },
    headers: new Headers({
      Authorization: `Bearer ${sessionToken}`
    })
  });
  if (session.user.needPasswordChange) {
    await prisma.user.update({
      where: {
        id: session.user.id
      },
      data: {
        needPasswordChange: false
      }
    });
  }
  const accessToken = tokenUtils.getAccessToken({
    userId: session.user.id,
    role: session.user.role,
    name: session.user.name,
    email: session.user.email,
    status: session.user.status,
    isDeleted: session.user.isDeleted,
    emailVerified: session.user.emailVerified
  });
  const refreshToken = tokenUtils.getRefreshToken({
    userId: session.user.id,
    role: session.user.role,
    name: session.user.name,
    email: session.user.email,
    status: session.user.status,
    isDeleted: session.user.isDeleted,
    emailVerified: session.user.emailVerified
  });
  return {
    ...result,
    accessToken,
    refreshToken
  };
};
var verifyEmail = async (email, otp) => {
  const result = await auth.api.verifyEmailOTP({
    body: {
      email,
      otp
    }
  });
  if (result.status && !result.user.emailVerified) {
    await prisma.user.update({
      where: {
        email
      },
      data: {
        emailVerified: true
      }
    });
  }
};
var forgetPassword = async (email) => {
  const isUserExist = await prisma.user.findUnique({
    where: {
      email
    }
  });
  if (!isUserExist) {
    throw new AppError_default(status3.NOT_FOUND, "User not found");
  }
  if (!isUserExist.emailVerified) {
    throw new AppError_default(status3.BAD_REQUEST, "Email not verified");
  }
  if (isUserExist.isDeleted || isUserExist.status === UserStatus.DELETED) {
    throw new AppError_default(status3.NOT_FOUND, "User not found");
  }
  await auth.api.requestPasswordResetEmailOTP({
    body: {
      email
    }
  });
};
var resetPassword = async (email, otp, newPassword) => {
  const isUserExist = await prisma.user.findUnique({
    where: {
      email
    }
  });
  if (!isUserExist) {
    throw new AppError_default(status3.NOT_FOUND, "User not found");
  }
  if (!isUserExist.emailVerified) {
    throw new AppError_default(status3.BAD_REQUEST, "Email not verified");
  }
  if (isUserExist.isDeleted || isUserExist.status === UserStatus.DELETED) {
    throw new AppError_default(status3.NOT_FOUND, "User not found");
  }
  await auth.api.resetPasswordEmailOTP({
    body: {
      email,
      otp,
      password: newPassword
    }
  });
  if (isUserExist.needPasswordChange) {
    await prisma.user.update({
      where: {
        id: isUserExist.id
      },
      data: {
        needPasswordChange: false
      }
    });
  }
  await prisma.session.deleteMany({
    where: {
      userId: isUserExist.id
    }
  });
};
var googleLoginSuccess = async (session) => {
  const isUserExists = await prisma.user.findUnique({
    where: {
      id: session.user.id
    }
  });
  if (!isUserExists) {
    await prisma.user.create({
      data: {
        id: session.user.id,
        role: "MEMBER",
        name: session.user.name,
        email: session.user.email
      }
    });
  }
  const accessToken = tokenUtils.getAccessToken({
    userId: session.user.id,
    role: session.user.role,
    name: session.user.name
  });
  const refreshToken = tokenUtils.getRefreshToken({
    userId: session.user.id,
    role: session.user.role,
    name: session.user.name
  });
  return {
    accessToken,
    refreshToken
  };
};
var AuthService = {
  registerUser,
  loginUser,
  getMe,
  getNewToken,
  changePassword,
  logoutUser,
  verifyEmail,
  forgetPassword,
  resetPassword,
  googleLoginSuccess
};

// src/app/shared/sendResponse.ts
var sendResponse = (res, responseData) => {
  const { httpStatusCode, success, message, data, meta } = responseData;
  res.status(httpStatusCode).json({
    success,
    message,
    data,
    meta
  });
};

// src/app/module/auth/auth.controller.ts
import status4 from "http-status";
var register = catchAsync(async (req, res) => {
  const payload = req.body;
  const result = await AuthService.registerUser(payload);
  const { accessToken, refreshToken, token, ...rest } = result;
  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, refreshToken);
  tokenUtils.setBetterAuthSessionCookie(res, token);
  sendResponse(res, {
    httpStatusCode: status4.CREATED,
    success: true,
    message: payload.isModerator ? "Moderator registered successfully" : "Member registered successfully",
    data: {
      token,
      accessToken,
      refreshToken,
      ...rest
    }
  });
});
var loginUser2 = catchAsync(async (req, res) => {
  const payload = req.body;
  const result = await AuthService.loginUser(payload);
  const { accessToken, refreshToken, token, ...rest } = result;
  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, refreshToken);
  tokenUtils.setBetterAuthSessionCookie(res, token);
  sendResponse(res, {
    httpStatusCode: status4.OK,
    success: true,
    message: "User logged in successfully",
    data: {
      token,
      accessToken,
      refreshToken,
      ...rest
    }
  });
});
var getMe2 = catchAsync(
  async (req, res) => {
    const user = req.user;
    const result = await AuthService.getMe(user);
    sendResponse(res, {
      httpStatusCode: status4.OK,
      success: true,
      message: "User profile fetched successfully",
      data: result
    });
  }
);
var getNewToken2 = catchAsync(
  async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    const betterAuthSessionToken = req.cookies["better-auth.session_token"];
    if (!refreshToken) {
      throw new AppError_default(status4.UNAUTHORIZED, "Refresh token is missing");
    }
    const result = await AuthService.getNewToken(refreshToken, betterAuthSessionToken);
    const { accessToken, refreshToken: newRefreshToken, sessionToken } = result;
    tokenUtils.setAccessTokenCookie(res, accessToken);
    tokenUtils.setRefreshTokenCookie(res, newRefreshToken);
    tokenUtils.setBetterAuthSessionCookie(res, sessionToken);
    sendResponse(res, {
      httpStatusCode: status4.OK,
      success: true,
      message: "New tokens generated successfully",
      data: {
        accessToken,
        refreshToken: newRefreshToken,
        sessionToken
      }
    });
  }
);
var changePassword2 = catchAsync(
  async (req, res) => {
    const payload = req.body;
    const betterAuthSessionToken = req.cookies["better-auth.session_token"];
    const result = await AuthService.changePassword(payload, betterAuthSessionToken);
    const { accessToken, refreshToken, token } = result;
    tokenUtils.setAccessTokenCookie(res, accessToken);
    tokenUtils.setRefreshTokenCookie(res, refreshToken);
    tokenUtils.setBetterAuthSessionCookie(res, token);
    sendResponse(res, {
      httpStatusCode: status4.OK,
      success: true,
      message: "Password changed successfully",
      data: result
    });
  }
);
var logoutUser2 = catchAsync(
  async (req, res) => {
    const betterAuthSessionToken = req.cookies["better-auth.session_token"];
    const result = await AuthService.logoutUser(betterAuthSessionToken);
    CookieUtils.clearCookie(res, "accessToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none"
    });
    CookieUtils.clearCookie(res, "refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none"
    });
    CookieUtils.clearCookie(res, "better-auth.session_token", {
      httpOnly: true,
      secure: true,
      sameSite: "none"
    });
    sendResponse(res, {
      httpStatusCode: status4.OK,
      success: true,
      message: "User logged out successfully",
      data: result
    });
  }
);
var verifyEmail2 = catchAsync(
  async (req, res) => {
    const { email, otp } = req.body;
    await AuthService.verifyEmail(email, otp);
    sendResponse(res, {
      httpStatusCode: status4.OK,
      success: true,
      message: "Email verified successfully"
    });
  }
);
var forgetPassword2 = catchAsync(
  async (req, res) => {
    const { email } = req.body;
    await AuthService.forgetPassword(email);
    sendResponse(res, {
      httpStatusCode: status4.OK,
      success: true,
      message: "Password reset OTP sent to email successfully"
    });
  }
);
var resetPassword2 = catchAsync(
  async (req, res) => {
    const { email, otp, newPassword } = req.body;
    await AuthService.resetPassword(email, otp, newPassword);
    sendResponse(res, {
      httpStatusCode: status4.OK,
      success: true,
      message: "Password reset successfully"
    });
  }
);
var googleLogin = catchAsync((req, res) => {
  const redirectPath = req.query.redirect || "/dashboard";
  const encodedRedirectPath = encodeURIComponent(redirectPath);
  const callbackURL = `${envVars.BETTER_AUTH_URL}/api/v1/auth/google/success?redirect=${encodedRedirectPath}`;
  res.render("googleRedirect", {
    callbackURL,
    betterAuthUrl: envVars.BETTER_AUTH_URL
  });
});
var googleLoginSuccess2 = catchAsync(async (req, res) => {
  const redirectPath = req.query.redirect || "/dashboard";
  const sessionToken = req.cookies["better-auth.session_token"];
  if (!sessionToken) {
    return res.redirect(`${envVars.FRONTEND_URL}/login?error=oauth_failed`);
  }
  const session = await auth.api.getSession({
    headers: {
      "Cookie": `better-auth.session_token=${sessionToken}`
    }
  });
  if (!session) {
    return res.redirect(`${envVars.FRONTEND_URL}/login?error=no_session_found`);
  }
  if (session && !session.user) {
    return res.redirect(`${envVars.FRONTEND_URL}/login?error=no_user_found`);
  }
  const result = await AuthService.googleLoginSuccess(session);
  const { accessToken, refreshToken } = result;
  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, refreshToken);
  const isValidRedirectPath = redirectPath.startsWith("/") && !redirectPath.startsWith("//");
  const finalRedirectPath = isValidRedirectPath ? redirectPath : "/dashboard";
  res.redirect(`${envVars.FRONTEND_URL}${finalRedirectPath}`);
});
var handleOAuthError = catchAsync((req, res) => {
  console.log(req.query);
  const error = req.query.error || "oauth_failed";
  res.redirect(`${envVars.FRONTEND_URL}/login?error=${error}`);
});
var AuthController = {
  register,
  loginUser: loginUser2,
  getMe: getMe2,
  getNewToken: getNewToken2,
  changePassword: changePassword2,
  logoutUser: logoutUser2,
  verifyEmail: verifyEmail2,
  forgetPassword: forgetPassword2,
  resetPassword: resetPassword2,
  googleLogin,
  googleLoginSuccess: googleLoginSuccess2,
  handleOAuthError
};

// src/app/middleware/checkAuth.ts
import status5 from "http-status";
var checkAuth = (...authRoles) => async (req, res, next) => {
  try {
    const sessionToken = CookieUtils.getCookie(req, "better-auth.session_token");
    const accessToken = CookieUtils.getCookie(req, "accessToken");
    let user = null;
    if (sessionToken) {
      const sessionData = await prisma.session.findFirst({
        where: {
          token: sessionToken,
          expiresAt: {
            gt: /* @__PURE__ */ new Date()
          }
        },
        include: {
          user: true
        }
      });
      if (sessionData && sessionData.user) {
        user = sessionData.user;
        const now = /* @__PURE__ */ new Date();
        const expiresAt = new Date(sessionData.expiresAt);
        const createdAt = new Date(sessionData.createdAt);
        const sessionLifeTime = expiresAt.getTime() - createdAt.getTime();
        const timeRemaining = expiresAt.getTime() - now.getTime();
        const percentRemaining = timeRemaining / sessionLifeTime * 100;
        if (percentRemaining < 20) {
          res.setHeader("X-Session-Refresh", "true");
          res.setHeader("X-Session-Expires-At", expiresAt.toISOString());
          console.log("Session expiring soon - marking for refresh");
        }
      }
    }
    console.log("User from session token:", user);
    if (!user && accessToken) {
      const verifiedToken = jwtUtils.verifyToken(accessToken, envVars.ACCESS_TOKEN_SECRET);
      if (verifiedToken.success && verifiedToken.data) {
        const userId = verifiedToken.data.userId || verifiedToken.data.id;
        if (userId) {
          user = await prisma.user.findUnique({
            where: { id: userId }
          });
        }
      }
    }
    if (!user) {
      throw new AppError_default(status5.UNAUTHORIZED, "Unauthorized access! Please log in to continue.");
    }
    if (user.status === UserStatus.BLOCKED || user.status === UserStatus.DELETED || user.isDeleted) {
      throw new AppError_default(status5.UNAUTHORIZED, "Unauthorized access! Your account is not active.");
    }
    if (authRoles.length > 0) {
      const isAuthorized = authRoles.includes(user.role) || user.role === Role.SUPER_ADMIN;
      if (!isAuthorized) {
        throw new AppError_default(status5.FORBIDDEN, "Forbidden access! You do not have permission to access this resource.");
      }
    }
    console.log("User from checkAuth:", user);
    req.user = {
      userId: user.id,
      role: user.role,
      email: user.email
    };
    next();
  } catch (error) {
    next(error);
  }
};

// src/app/middleware/validateRequest.ts
var validateRequest = (zodSchema) => {
  return (req, res, next) => {
    let bodyToValidate = req.body;
    const dataKey = Object.keys(req.body || {}).find(
      (key) => key.trim() === "data"
    );
    if (dataKey && typeof req.body[dataKey] === "string") {
      try {
        bodyToValidate = JSON.parse(req.body[dataKey]);
      } catch {
      }
    }
    const parsedResult = zodSchema.safeParse(bodyToValidate);
    if (!parsedResult.success) {
      return next(parsedResult.error);
    }
    req.body = parsedResult.data;
    next();
  };
};

// src/app/module/auth/auth.validator.ts
import z from "zod";
var loginZodSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters long")
});
var registerZodSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters long").regex(/[A-Z]/, "Password must contain at least one uppercase letter").regex(/[a-z]/, "Password must contain at least one lowercase letter").regex(/[0-9]/, "Password must contain at least one number").regex(/[@$!%*?&]/, "Password must contain at least one special character"),
  isModerator: z.boolean().optional(),
  profileData: z.object({
    profilePhoto: z.string().url().optional(),
    contactNumber: z.string().min(7).optional(),
    bio: z.string().max(1e3).optional(),
    address: z.string().max(300).optional(),
    phoneNumber: z.string().min(10).optional(),
    reputationScore: z.number().min(0).optional(),
    socialLinks: z.object({
      twitter: z.string().url().optional(),
      github: z.string().url().optional(),
      linkedin: z.string().url().optional(),
      website: z.string().url().optional()
    }).optional(),
    assignNotes: z.string().max(1e3).optional()
  }).optional()
}).refine((data) => {
  if (data.isModerator) {
    return !!data.profileData;
  }
  return true;
}, {
  message: "profileData is required when isModerator is true",
  path: ["profileData"]
});

// src/app/module/auth/auth.route.ts
var router = Router();
router.post("/register", validateRequest(registerZodSchema), AuthController.register);
router.post("/login", validateRequest(loginZodSchema), AuthController.loginUser);
router.get("/me", checkAuth(Role.ADMIN, Role.MODERATOR, Role.MEMBER, Role.SUPER_ADMIN), AuthController.getMe);
router.post("/refresh-token", AuthController.getNewToken);
router.post("/change-password", checkAuth(Role.ADMIN, Role.MODERATOR, Role.MEMBER, Role.SUPER_ADMIN), AuthController.changePassword);
router.post("/logout", checkAuth(Role.ADMIN, Role.MODERATOR, Role.MEMBER, Role.SUPER_ADMIN), AuthController.logoutUser);
router.post("/verify-email", AuthController.verifyEmail);
router.post("/forget-password", AuthController.forgetPassword);
router.post("/reset-password", AuthController.resetPassword);
router.get("/login/google", AuthController.googleLogin);
router.get("/google/success", AuthController.googleLoginSuccess);
router.get("/oauth/error", AuthController.handleOAuthError);
var AuthRoutes = router;

// src/app/module/admin/admin.route.ts
import { Router as Router2 } from "express";

// src/app/module/admin/admin.controller.ts
import status6 from "http-status";

// src/app/module/admin/admin.service.ts
import httpStatus from "http-status";

// src/app/module/admin/admin.constant.ts
var adminSearchableFields = ["name", "email"];
var adminFilterableFields = ["user.status", "isDeleted"];
var adminIncludeConfig = {
  user: {
    select: {
      id: true,
      email: true,
      status: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          ideas: true,
          purchasedIdeas: true,
          followers: true,
          following: true,
          reviewsPerformed: true
        }
      }
    }
  }
};

// src/app/utils/QueryBuilder.ts
var QueryBuilder = class {
  constructor(model, queryParams, config2 = {}) {
    this.model = model;
    this.queryParams = queryParams;
    this.config = config2;
    this.query = {
      where: {},
      orderBy: {},
      skip: 0,
      take: 10
    };
    this.countQuery = {
      where: {}
    };
  }
  query;
  countQuery;
  page = 1;
  limit = 10;
  skip = 0;
  sortBy = "createdAt";
  sortOrder = "desc";
  selectFields;
  search() {
    const { searchTerm } = this.queryParams;
    const { searchableFields } = this.config;
    if (searchTerm && searchableFields && searchableFields.length > 0) {
      const searchConditions = searchableFields.map(
        (field) => {
          if (field.includes(".")) {
            const parts = field.split(".");
            if (parts?.length === 2) {
              const relation = parts[0];
              const nestedField = parts[1];
              const stringFilter2 = {
                contains: searchTerm,
                mode: "insensitive"
              };
              return {
                [relation]: {
                  [nestedField]: stringFilter2
                }
              };
            } else if (parts.length === 3) {
              const relation = parts[0];
              const nestedRelation = parts[1];
              const nestedField = parts[2];
              const stringFilter2 = {
                contains: searchTerm,
                mode: "insensitive"
              };
              return {
                [relation]: {
                  some: {
                    [nestedRelation]: {
                      [nestedField]: stringFilter2
                    }
                  }
                }
              };
            }
          }
          const stringFilter = {
            contains: searchTerm,
            mode: "insensitive"
          };
          return {
            [field]: stringFilter
          };
        }
      );
      const whereConditions = this.query.where;
      whereConditions.OR = searchConditions;
      const countWhereConditions = this.countQuery.where;
      countWhereConditions.OR = searchConditions;
    }
    return this;
  }
  filter() {
    const { filterableFields } = this.config;
    const excludedField = ["searchTerm", "page", "limit", "sortBy", "sortOrder", "fields", "include"];
    const filterParams = {};
    Object.keys(this.queryParams).forEach((key) => {
      if (!excludedField.includes(key)) {
        filterParams[key] = this.queryParams[key];
      }
    });
    const queryWhere = this.query.where;
    const countQueryWhere = this.countQuery.where;
    Object.keys(filterParams).forEach((key) => {
      const value = filterParams[key];
      if (value === void 0 || value === "") {
        return;
      }
      const isAllowedField = !filterableFields || filterableFields.length === 0 || filterableFields.some((f) => f === key || f.startsWith(key + "."));
      if (key.includes(".")) {
        const parts = key.split(".");
        if (filterableFields && !filterableFields.includes(key)) {
          return;
        }
        if (parts.length === 2) {
          const relation = parts[0];
          const nestedField = parts[1];
          if (!queryWhere[relation]) {
            queryWhere[relation] = {};
            countQueryWhere[relation] = {};
          }
          const queryRelation = queryWhere[relation];
          const countRelation = countQueryWhere[relation];
          queryRelation[nestedField] = this.parseFilterValue(value);
          countRelation[nestedField] = this.parseFilterValue(value);
          return;
        } else if (parts.length === 3) {
          const relation = parts[0];
          const nestedRelation = parts[1];
          const nestedField = parts[2];
          if (!queryWhere[relation]) {
            queryWhere[relation] = {
              some: {}
            };
            countQueryWhere[relation] = {
              some: {}
            };
          }
          const queryRelation = queryWhere[relation];
          const countRelation = countQueryWhere[relation];
          if (!queryRelation.some) {
            queryRelation.some = {};
          }
          if (!countRelation.some) {
            countRelation.some = {};
          }
          const querySome = queryRelation.some;
          const countSome = countRelation.some;
          const queryNestedRelation = querySome[nestedRelation] || {};
          const countNestedRelation = countSome[nestedRelation] || {};
          queryNestedRelation[nestedField] = this.parseFilterValue(value);
          countNestedRelation[nestedField] = this.parseFilterValue(value);
          querySome[nestedRelation] = queryNestedRelation;
          countSome[nestedRelation] = countNestedRelation;
          return;
        }
      }
      if (!isAllowedField) {
        return;
      }
      if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        queryWhere[key] = this.parseRangeFilter(value);
        countQueryWhere[key] = this.parseRangeFilter(value);
        return;
      }
      queryWhere[key] = this.parseFilterValue(value);
      countQueryWhere[key] = this.parseFilterValue(value);
    });
    return this;
  }
  paginate() {
    const page = Number(this.queryParams.page) || 1;
    const limit = Number(this.queryParams.limit) || 10;
    this.page = page;
    this.limit = limit;
    this.skip = (page - 1) * limit;
    this.query.skip = this.skip;
    this.query.take = this.limit;
    return this;
  }
  sort() {
    const sortBy = this.queryParams.sortBy || "createdAt";
    const sortOrder = this.queryParams.sortOrder === "asc" ? "asc" : "desc";
    this.sortBy = sortBy;
    this.sortOrder = sortOrder;
    if (sortBy.includes(".")) {
      const parts = sortBy.split(".");
      if (parts.length === 2) {
        const relation = parts[0];
        const nestedField = parts[1];
        this.query.orderBy = {
          [relation]: {
            [nestedField]: sortOrder
          }
        };
      } else if (parts.length === 3) {
        const relation = parts[0];
        const nestedField = parts[1];
        const nestedRelation = parts[2];
        this.query.orderBy = {
          [relation]: {
            [nestedRelation]: {
              [nestedField]: sortOrder
            }
          }
        };
      } else {
        this.query.orderBy = {
          [sortBy]: sortOrder
        };
      }
    } else {
      this.query.orderBy = {
        [sortBy]: sortOrder
      };
    }
    return this;
  }
  fields() {
    const fieldsParam = this.queryParams.fields;
    if (fieldsParam && typeof fieldsParam === "string" && fieldsParam.trim() !== "") {
      const fieldsArray = fieldsParam.split(",").map((field) => field.trim()).filter((field) => field !== "");
      if (fieldsArray.length > 0) {
        this.selectFields = {};
        fieldsArray.forEach((field) => {
          if (this.selectFields) {
            this.selectFields[field] = true;
          }
        });
        if (Object.keys(this.selectFields).length > 0) {
          this.query.select = this.selectFields;
          this.query.include = void 0;
        }
      }
    }
    return this;
  }
  include(relation) {
    if (this.selectFields || this.query.select) {
      return this;
    }
    if (!this.query.include) {
      this.query.include = {};
    }
    this.query.include = { ...this.query.include, ...relation };
    return this;
  }
  dynamicInclude(includeConfig, defaultInclude) {
    if (this.selectFields || this.query.select) {
      return this;
    }
    const result = {};
    defaultInclude?.forEach((field) => {
      if (includeConfig[field]) {
        result[field] = includeConfig[field];
      }
    });
    const includeParam = this.queryParams.include;
    if (includeParam && typeof includeParam === "string") {
      const requestedRelations = includeParam.split(",").map((relation) => relation.trim());
      requestedRelations.forEach((relation) => {
        if (includeConfig[relation]) {
          result[relation] = includeConfig[relation];
        }
      });
    }
    if (!this.query.include) {
      this.query.include = {};
    }
    this.query.include = { ...this.query.include, ...result };
    return this;
  }
  where(condition) {
    this.query.where = this.deepMerge(this.query.where, condition);
    this.countQuery.where = this.deepMerge(this.countQuery.where, condition);
    return this;
  }
  async execute() {
    const cleanQuery = {
      where: this.query.where,
      orderBy: this.query.orderBy,
      skip: this.query.skip,
      take: this.query.take
    };
    if (this.query.select && typeof this.query.select === "object" && Object.keys(this.query.select).length > 0) {
      cleanQuery.select = this.query.select;
    }
    if (this.query.include && typeof this.query.include === "object" && Object.keys(this.query.include).length > 0 && !cleanQuery.select) {
      cleanQuery.include = this.query.include;
    }
    const [total, data] = await Promise.all([
      this.model.count(this.countQuery),
      this.model.findMany(cleanQuery)
    ]);
    const totalPages = Math.ceil(total / this.limit);
    return {
      data,
      meta: {
        page: this.page,
        limit: this.limit,
        total,
        totalPages
      }
    };
  }
  async count() {
    return await this.model.count(this.countQuery);
  }
  getQuery() {
    return this.query;
  }
  deepMerge(target, source) {
    const result = { ...target };
    for (const key in source) {
      if (source[key] && typeof source[key] === "object" && !Array.isArray(source[key])) {
        if (result[key] && typeof result[key] === "object" && !Array.isArray(result[key])) {
          result[key] = this.deepMerge(result[key], source[key]);
        } else {
          result[key] = source[key];
        }
      } else {
        result[key] = source[key];
      }
    }
    return result;
  }
  parseFilterValue(value) {
    if (value === "true") {
      return true;
    }
    if (value === "false") {
      return false;
    }
    if (typeof value === "string" && !isNaN(Number(value)) && value != "") {
      return Number(value);
    }
    if (Array.isArray(value)) {
      return { in: value.map((item) => this.parseFilterValue(item)) };
    }
    return value;
  }
  parseRangeFilter(value) {
    const rangeQuery = {};
    Object.keys(value).forEach((operator) => {
      const operatorValue = value[operator];
      const parsedValue = typeof operatorValue === "string" && !isNaN(Number(operatorValue)) ? Number(operatorValue) : operatorValue;
      switch (operator) {
        case "lt":
        case "lte":
        case "gt":
        case "gte":
        case "equals":
        case "not":
        case "contains":
        case "startsWith":
        case "endsWith":
          rangeQuery[operator] = parsedValue;
          break;
        case "in":
        case "notIn":
          if (Array.isArray(operatorValue)) {
            rangeQuery[operator] = operatorValue;
          } else {
            rangeQuery[operator] = [parsedValue];
          }
          break;
        default:
          break;
      }
    });
    return Object.keys(rangeQuery).length > 0 ? rangeQuery : value;
  }
};

// src/app/module/admin/admin.service.ts
var getAllAdmins = async (queryParams) => {
  const queryBuilder = new QueryBuilder(
    prisma.admin,
    queryParams,
    {
      searchableFields: adminSearchableFields,
      filterableFields: adminFilterableFields
    }
  );
  return await queryBuilder.search().filter().paginate().sort().include(adminIncludeConfig).execute();
};
var createAdmin = async (payload) => {
  const { name, email, password, contactNumber, profilePhoto } = payload;
  const isUserExists = await prisma.user.findUnique({
    where: { email }
  });
  if (isUserExists) {
    throw new AppError_default(httpStatus.BAD_REQUEST, "User with this email already exists");
  }
  const data = await auth.api.signUpEmail({
    body: {
      name,
      email,
      password,
      role: Role.ADMIN
    }
  });
  if (!data?.user) {
    throw new AppError_default(httpStatus.BAD_REQUEST, "Failed to create user in auth system");
  }
  try {
    const result = await prisma.$transaction(async (tx) => {
      const admin = await tx.admin.create({
        data: {
          userId: data.user.id,
          name,
          email,
          contactNumber: contactNumber || null,
          profilePhoto: profilePhoto || null
        },
        include: {
          user: true
        }
      });
      await tx.user.update({
        where: { id: data.user.id },
        data: {
          emailVerified: true,
          status: UserStatus.ACTIVE
        }
      });
      return admin;
    });
    return result;
  } catch (error) {
    await prisma.user.delete({ where: { id: data.user.id } });
    throw new AppError_default(httpStatus.INTERNAL_SERVER_ERROR, "Transaction failed, user rolled back");
  }
};
var getAdminById = async (id) => {
  const admin = await prisma.admin.findUnique({
    where: {
      id
    },
    include: {
      user: true
    }
  });
  return admin;
};
var getPublicProfileByUserId = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      admin: true,
      moderator: true,
      _count: {
        select: {
          ideas: true,
          followers: true,
          following: true
        }
      }
    }
  });
  if (!user) {
    throw new AppError_default(httpStatus.NOT_FOUND, "User profile not found");
  }
  return user;
};
var updateAdmin = async (id, payload, requester) => {
  const isAdminExist = await prisma.admin.findUnique({
    where: {
      userId: id
    },
    include: {
      user: true
    }
  });
  if (!isAdminExist) {
    throw new AppError_default(httpStatus.NOT_FOUND, "Admin Or Super Admin record not found");
  }
  console.log("payload", payload);
  if (requester.role === Role.ADMIN) {
    if (isAdminExist.user.role === Role.SUPER_ADMIN) {
      throw new AppError_default(httpStatus.FORBIDDEN, "Admin cannot update a Super Admin profile");
    }
    if (isAdminExist.userId !== requester.userId) {
      throw new AppError_default(httpStatus.FORBIDDEN, "Only Super Admin can update other Admin accounts");
    }
  }
  if (requester.role === Role.SUPER_ADMIN) {
  } else if (requester.role !== Role.ADMIN) {
    throw new AppError_default(httpStatus.FORBIDDEN, "Unauthorized to update admin profile");
  }
  const result = await prisma.$transaction(async (tx) => {
    const updatedAdmin = await tx.admin.update({
      where: {
        userId: id
        // id passed from controller is the userId
      },
      data: {
        ...payload
      }
    });
    await tx.user.update({
      where: {
        id: isAdminExist.userId
      },
      data: {
        name: updatedAdmin.name,
        image: updatedAdmin.profilePhoto
      }
    });
    return await prisma.admin.findUnique({
      where: {
        userId: id
      },
      include: {
        user: true
      }
    });
    ;
  });
  return result;
};
var deleteAdmin = async (id, user) => {
  const isAdminExist = await prisma.admin.findUnique({
    where: {
      id
    }
  });
  if (!isAdminExist) {
    throw new AppError_default(httpStatus.NOT_FOUND, "Admin Or Super Admin not found");
  }
  if (isAdminExist.id === user.userId) {
    throw new AppError_default(httpStatus.BAD_REQUEST, "You cannot delete yourself");
  }
  const result = await prisma.$transaction(
    async (tx) => {
      await tx.admin.update({
        where: { id },
        data: {
          isDeleted: true,
          deletedAt: /* @__PURE__ */ new Date()
        }
      });
      await tx.user.update({
        where: { id: isAdminExist.userId },
        data: {
          isDeleted: true,
          deletedAt: /* @__PURE__ */ new Date(),
          status: UserStatus.DELETED
          // Optional: you may also want to block the user
        }
      });
      await tx.session.deleteMany({
        where: { userId: isAdminExist.userId }
      });
      await tx.account.deleteMany({
        where: { userId: isAdminExist.userId }
      });
      const admin = await getAdminById(id);
      return admin;
    }
  );
  return result;
};
var changeUserStatus = async (user, payload) => {
  console.log("user", user);
  console.log("payload", payload);
  const isAdminExists = await prisma.admin.findUniqueOrThrow({
    where: {
      email: user.email
    },
    include: {
      user: true
    }
  });
  console.log("isAdminExists changeUserStatus", isAdminExists);
  const { userId, userStatus } = payload;
  const userToChangeStatus = await prisma.user.findUniqueOrThrow({
    where: {
      id: userId
    }
  });
  const selfStatusChange = isAdminExists.userId === userId;
  if (selfStatusChange) {
    throw new AppError_default(httpStatus.BAD_REQUEST, "You cannot change your own status");
  }
  ;
  if (isAdminExists.user.role === Role.ADMIN && userToChangeStatus.role === Role.SUPER_ADMIN) {
    throw new AppError_default(httpStatus.BAD_REQUEST, "You cannot change the status of super admin. Only super admin can change the status of another super admin");
  }
  if (isAdminExists.user.role === Role.ADMIN && userToChangeStatus.role === Role.ADMIN) {
    throw new AppError_default(httpStatus.BAD_REQUEST, "You cannot change the status of another admin. Only super admin can change the status of another admin");
  }
  if (userStatus === UserStatus.DELETED) {
    throw new AppError_default(httpStatus.BAD_REQUEST, "You cannot set user status to deleted. To delete a user, you have to use role specific delete api. For example, to delete an doctor user, you have to use delete moderator api which will set the user status to deleted and also set isDeleted to true and also delete the user session and account");
  }
  const updatedUser = await prisma.user.update({
    where: {
      id: userId
    },
    data: {
      status: userStatus
    }
  });
  return updatedUser;
};
var changeUserRole = async (user, payload) => {
  console.log("user", user);
  console.log("payload", payload);
  const isSuperAdminExists = await prisma.admin.findFirstOrThrow({
    where: {
      email: user.email,
      user: {
        role: Role.SUPER_ADMIN
      }
    },
    include: {
      user: true
    }
  });
  console.log("isSuperAdminExists changeUserRole", isSuperAdminExists);
  const { userId, role } = payload;
  const userToChangeRole = await prisma.user.findUniqueOrThrow({
    where: {
      id: userId
    }
  });
  const selfRoleChange = isSuperAdminExists.userId === userId;
  if (selfRoleChange) {
    throw new AppError_default(httpStatus.BAD_REQUEST, "You cannot change your own role");
  }
  if (userToChangeRole.role === Role.MEMBER || userToChangeRole.role === Role.MODERATOR) {
    throw new AppError_default(httpStatus.BAD_REQUEST, "You cannot change the role of member or moderator user. If you want to change the role of member or moderator user, you have to delete the user and recreate with new role");
  }
  const updatedUser = await prisma.user.update({
    where: {
      id: userId
    },
    data: {
      role
    }
  });
  return updatedUser;
};
var getAllUsers = async (queryParams) => {
  const userSearchableFields = ["name", "email"];
  const userFilterableFields = ["role", "user.status", "isDeleted"];
  const userQuery = new QueryBuilder(prisma.user, queryParams, {
    searchableFields: userSearchableFields,
    filterableFields: userFilterableFields
  }).search().filter().paginate().sort();
  return await userQuery.execute();
};
var getUserById = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      admin: true,
      moderator: true,
      _count: {
        select: {
          ideas: true,
          purchasedIdeas: true,
          followers: true,
          following: true
        }
      }
    }
  });
  if (!user) {
    throw new AppError_default(httpStatus.NOT_FOUND, "User not found");
  }
  return user;
};
var deleteUserAccount = async (id, requester) => {
  const userToDelete = await prisma.user.findUniqueOrThrow({
    where: { id }
  });
  if (userToDelete.id === requester.userId) {
    throw new AppError_default(httpStatus.BAD_REQUEST, "You cannot delete your own account");
  }
  if (requester.role === Role.ADMIN && (userToDelete.role === Role.ADMIN || userToDelete.role === Role.SUPER_ADMIN)) {
    throw new AppError_default(httpStatus.FORBIDDEN, "Only Super Admin can delete other Admins/Super Admins");
  }
  return await prisma.$transaction(async (tx) => {
    const updatedUser = await tx.user.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: /* @__PURE__ */ new Date(),
        status: UserStatus.BLOCKED
        // Prevent login
      }
    });
    if (userToDelete.role === Role.ADMIN || userToDelete.role === Role.SUPER_ADMIN) {
      await tx.admin.updateMany({
        where: { userId: id },
        data: { isDeleted: true, deletedAt: /* @__PURE__ */ new Date() }
      });
    }
    if (userToDelete.role === Role.MODERATOR) {
      await tx.moderator.updateMany({
        where: { userId: id },
        data: { isDeleted: true, deletedAt: /* @__PURE__ */ new Date() }
      });
    }
    await tx.session.deleteMany({ where: { userId: id } });
    return updatedUser;
  });
};
var AdminService = {
  getAllAdmins,
  createAdmin,
  getAdminById,
  getPublicProfileByUserId,
  updateAdmin,
  deleteAdmin,
  changeUserStatus,
  changeUserRole,
  getAllUsers,
  getUserById,
  deleteUserAccount
};

// src/app/module/admin/admin.controller.ts
var getAllAdmins2 = catchAsync(async (req, res) => {
  const result = await AdminService.getAllAdmins(req.query);
  sendResponse(res, {
    httpStatusCode: status6.OK,
    success: true,
    message: "Admins fetched successfully",
    data: result.data,
    meta: result.meta
  });
});
var getAdminById2 = catchAsync(
  async (req, res) => {
    const { id } = req.params;
    const admin = await AdminService.getAdminById(String(id));
    sendResponse(res, {
      httpStatusCode: status6.OK,
      success: true,
      message: "Admin fetched successfully",
      data: admin
    });
  }
);
var getPublicProfileByUserId2 = catchAsync(
  async (req, res) => {
    const { id } = req.params;
    const user = await AdminService.getPublicProfileByUserId(String(id));
    sendResponse(res, {
      httpStatusCode: status6.OK,
      success: true,
      message: "Public Profile fetched successfully",
      data: user
    });
  }
);
var createAdmin2 = catchAsync(
  async (req, res) => {
    const payload = req.body;
    if (req.file) {
      payload.profilePhoto = req.file.path;
    }
    const result = await AdminService.createAdmin(payload);
    sendResponse(res, {
      httpStatusCode: status6.CREATED,
      success: true,
      message: "Admin created successfully",
      data: result
    });
  }
);
var updateAdmin2 = catchAsync(
  async (req, res) => {
    const { id } = req.params;
    const targetId = id || req.user.userId;
    const payload = req.body;
    if (req.file) {
      payload.profilePhoto = req.file.path;
    }
    const updatedAdmin = await AdminService.updateAdmin(String(targetId), payload, req.user);
    sendResponse(res, {
      httpStatusCode: status6.OK,
      success: true,
      message: "Admin updated successfully",
      data: updatedAdmin
    });
  }
);
var deleteAdmin2 = catchAsync(
  async (req, res) => {
    const { id } = req.params;
    const user = req.user;
    const result = await AdminService.deleteAdmin(id, user);
    sendResponse(res, {
      httpStatusCode: status6.OK,
      success: true,
      message: "Admin deleted successfully",
      data: result
    });
  }
);
var changeUserStatus2 = catchAsync(
  async (req, res) => {
    const user = req.user;
    const payload = req.body;
    console.log("Payload in controller", req.user, payload);
    const result = await AdminService.changeUserStatus(user, payload);
    sendResponse(res, {
      httpStatusCode: status6.OK,
      success: true,
      message: "User status changed successfully",
      data: result
    });
  }
);
var changeUserRole2 = catchAsync(
  async (req, res) => {
    const user = req.user;
    const payload = req.body;
    console.log("Payload in changeUserRole", req.user, payload);
    const result = await AdminService.changeUserRole(user, payload);
    sendResponse(res, {
      httpStatusCode: status6.OK,
      success: true,
      message: "User role changed successfully",
      data: result
    });
  }
);
var getAllUsers2 = catchAsync(async (req, res) => {
  const result = await AdminService.getAllUsers(req.query);
  sendResponse(res, {
    httpStatusCode: status6.OK,
    success: true,
    message: "Users fetched successfully",
    data: result.data,
    meta: result.meta
  });
});
var getUserById2 = catchAsync(async (req, res) => {
  const id = String(req.params.id);
  const result = await AdminService.getUserById(id);
  sendResponse(res, {
    httpStatusCode: status6.OK,
    success: true,
    message: "User fetched successfully",
    data: result
  });
});
var deleteUserAccount2 = catchAsync(async (req, res) => {
  const id = String(req.params.id);
  const requester = req.user;
  const result = await AdminService.deleteUserAccount(id, requester);
  sendResponse(res, {
    httpStatusCode: status6.OK,
    success: true,
    message: "User account soft-deleted successfully",
    data: result
  });
});
var AdminController = {
  getAllAdmins: getAllAdmins2,
  createAdmin: createAdmin2,
  updateAdmin: updateAdmin2,
  deleteAdmin: deleteAdmin2,
  getAdminById: getAdminById2,
  getPublicProfileByUserId: getPublicProfileByUserId2,
  changeUserStatus: changeUserStatus2,
  changeUserRole: changeUserRole2,
  getAllUsers: getAllUsers2,
  getUserById: getUserById2,
  deleteUserAccount: deleteUserAccount2
};

// src/app/module/admin/admin.validation.ts
import z2 from "zod";
var updateAdminZodSchema = z2.object({
  name: z2.string("Name must be a string").optional(),
  profilePhoto: z2.string("Profile photo must be a valid URL").optional(),
  contactNumber: z2.string("Contact number must be a string").min(11, "Contact number must be at least 11 characters").max(14, "Contact number must be at most 15 characters").optional()
});
var createAdminZodSchema = z2.object({
  name: z2.string(),
  email: z2.string().email(),
  password: z2.string().min(8, "Password must be at least 8 characters"),
  profilePhoto: z2.string().optional(),
  contactNumber: z2.string().min(11, "Contact number must be at least 11 characters").max(14, "Contact number must be at most 15 characters").optional()
});
var changeUserStatusZodSchema = z2.object({
  userId: z2.string(),
  userStatus: z2.enum([UserStatus.ACTIVE, UserStatus.BLOCKED, UserStatus.DELETED])
});
var changeUserRoleZodSchema = z2.object({
  userId: z2.string(),
  role: z2.enum([Role.ADMIN, Role.MODERATOR, Role.SUPER_ADMIN, Role.MEMBER])
});

// src/app/config/multer.config.ts
import { CloudinaryStorage } from "multer-storage-cloudinary";

// src/app/config/cloudinary.config.ts
import { v2 as cloudinary } from "cloudinary";
import status7 from "http-status";
cloudinary.config({
  cloud_name: envVars.CLOUDINARY.CLOUDINARY_CLOUD_NAME,
  api_key: envVars.CLOUDINARY.CLOUDINARY_API_KEY,
  api_secret: envVars.CLOUDINARY.CLOUDINARY_API_SECRET
});
var uploadFileToCloudinary = async (buffer, fileName) => {
  if (!buffer || !fileName) {
    throw new AppError_default(status7.BAD_REQUEST, "File buffer and file name are required for upload");
  }
  const extension = fileName.split(".").pop()?.toLocaleLowerCase();
  const fileNameWithoutExtension = fileName.split(".").slice(0, -1).join(".").toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "");
  const uniqueName = Math.random().toString(36).substring(2) + "-" + Date.now() + "-" + fileNameWithoutExtension;
  const folder = extension === "pdf" ? "pdfs" : "images";
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        resource_type: "auto",
        public_id: `ecovault/${folder}/${uniqueName}`,
        folder: `ecovault/${folder}`
      },
      (error, result) => {
        if (error) {
          return reject(new AppError_default(status7.INTERNAL_SERVER_ERROR, "Failed to upload file to Cloudinary"));
        }
        resolve(result);
      }
    ).end(buffer);
  });
};
var deleteFileFromCloudinary = async (url) => {
  try {
    const regex = /\/v\d+\/(.+?)(?:\.[a-zA-Z0-9]+)+$/;
    const match = url.match(regex);
    if (match && match[1]) {
      const publicId = match[1];
      await cloudinary.uploader.destroy(
        publicId,
        {
          resource_type: "image"
        }
      );
      console.log(`File ${publicId} deleted from cloudinary`);
    }
  } catch (error) {
    console.error("Error deleting file from Cloudinary:", error);
    throw new AppError_default(status7.INTERNAL_SERVER_ERROR, "Failed to delete file from Cloudinary");
  }
};
var cloudinaryUpload = cloudinary;

// src/app/config/multer.config.ts
import multer from "multer";
var storage = new CloudinaryStorage({
  cloudinary: cloudinaryUpload,
  params: async (req, file) => {
    const originName = file.originalname;
    const extension = originName.split(".").pop()?.toLocaleLowerCase();
    const fileNameWithoutExtension = originName.split(".").slice(0, -1).join(".").toLocaleLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "");
    const uniqueName = Math.random().toString(36).substring(2) + "-" + Date.now() + "-" + fileNameWithoutExtension;
    const folder = extension === "pdf" ? "pdfs" : "images";
    return {
      folder: `ecovault/${folder}`,
      public_id: uniqueName,
      resource_type: "auto"
    };
  }
});
var multerUpload = multer({ storage });

// src/app/module/admin/admin.route.ts
var router2 = Router2();
router2.get(
  "/",
  checkAuth(Role.SUPER_ADMIN),
  AdminController.getAllAdmins
);
router2.post(
  "/",
  checkAuth(Role.SUPER_ADMIN),
  multerUpload.single("file"),
  validateRequest(createAdminZodSchema),
  AdminController.createAdmin
);
router2.patch(
  "/change-user-status",
  checkAuth(Role.SUPER_ADMIN, Role.ADMIN),
  validateRequest(changeUserStatusZodSchema),
  AdminController.changeUserStatus
);
router2.patch(
  "/change-user-role",
  checkAuth(Role.SUPER_ADMIN),
  validateRequest(changeUserRoleZodSchema),
  AdminController.changeUserRole
);
router2.get(
  "/public-profile/:id",
  AdminController.getPublicProfileByUserId
);
router2.patch(
  "/profile",
  checkAuth(Role.SUPER_ADMIN, Role.ADMIN),
  multerUpload.single("file"),
  validateRequest(updateAdminZodSchema),
  AdminController.updateAdmin
);
router2.get(
  "/users",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  AdminController.getAllUsers
);
router2.get(
  "/users/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  AdminController.getUserById
);
router2.delete(
  "/users/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  AdminController.deleteUserAccount
);
router2.get(
  "/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  AdminController.getAdminById
);
router2.patch(
  "/:id",
  checkAuth(Role.SUPER_ADMIN),
  multerUpload.single("file"),
  validateRequest(updateAdminZodSchema),
  AdminController.updateAdmin
);
router2.delete(
  "/:id",
  checkAuth(Role.SUPER_ADMIN),
  AdminController.deleteAdmin
);
var AdminRoutes = router2;

// src/app/module/category/category.route.ts
import { Router as Router3 } from "express";

// src/app/module/category/category.controller.ts
import status8 from "http-status";

// src/app/module/category/category.service.ts
import httpStatus2 from "http-status";

// src/app/utils/slug.ts
var normalizeSlug = (value) => {
  return value.trim().toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-+|-+$/g, "");
};

// src/app/module/category/category.constant.ts
var categorySearchableFields = [
  "id",
  "name",
  "slug",
  "description"
];
var categoryFilterableFields = [
  "id",
  "name",
  "slug",
  "isActive",
  "createdAt",
  "updatedAt"
];
var categoryIncludeConfig = {
  ideas: true
};

// src/app/module/category/category.service.ts
var getAllCategories = async (query) => {
  const categoryQuery = new QueryBuilder(
    prisma.category,
    query,
    {
      searchableFields: categorySearchableFields,
      filterableFields: categoryFilterableFields
    }
  ).where({ isDeleted: false }).search().filter().paginate().sort().fields().dynamicInclude(categoryIncludeConfig);
  const result = await categoryQuery.execute();
  return result;
};
var getCategoryById = async (id, includeDeleted = false) => {
  const category = await prisma.category.findUnique({
    where: { id }
  });
  if (!category || !includeDeleted && category.isDeleted) {
    throw new AppError_default(httpStatus2.NOT_FOUND, "Category not found");
  }
  return category;
};
var createCategory = async (payload) => {
  const { name, slug, description, icon, color, isActive = true } = payload;
  const baseSlug = normalizeSlug(slug ?? name);
  const existing = await prisma.category.findFirst({
    where: {
      OR: [
        { name },
        { slug: baseSlug }
      ]
    }
  });
  if (existing) {
    if (existing.name === name) {
      throw new AppError_default(httpStatus2.CONFLICT, "Category name already exists");
    } else {
      throw new AppError_default(httpStatus2.CONFLICT, "Category slug already exists");
    }
  }
  const category = await prisma.category.create({
    data: {
      name,
      slug: baseSlug,
      description: description ?? null,
      icon: icon ?? null,
      color: color ?? null,
      isActive
    }
  });
  const finalSlug = `${baseSlug}-${category.id}`;
  const updatedCategory = await prisma.category.update({
    where: { id: category.id },
    data: { slug: finalSlug }
  });
  return updatedCategory;
};
var updateCategory = async (id, payload) => {
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) {
    throw new AppError_default(httpStatus2.NOT_FOUND, "Category not found");
  }
  const { name, slug, description, icon, color, isActive } = payload;
  if (name || slug) {
    const orConditions = [];
    if (name) orConditions.push({ name });
    if (slug) orConditions.push({ slug: normalizeSlug(slug) });
    const existing = await prisma.category.findFirst({
      where: {
        AND: [
          { id: { not: id } },
          { OR: orConditions }
        ]
      }
    });
    if (existing) {
      if (name && existing.name === name) {
        throw new AppError_default(httpStatus2.CONFLICT, "Category name already exists");
      } else {
        throw new AppError_default(httpStatus2.CONFLICT, "Category slug already exists");
      }
    }
  }
  const updateData = {};
  if (name !== void 0) updateData.name = name;
  if (description !== void 0) updateData.description = description;
  if (icon !== void 0) {
    if (category.icon && category.icon !== icon) {
      await deleteFileFromCloudinary(category.icon);
    }
    updateData.icon = icon;
  }
  if (color !== void 0) updateData.color = color;
  if (isActive !== void 0) updateData.isActive = isActive;
  let finalSlug;
  if (slug || name) {
    const baseSlug = normalizeSlug(slug ?? name);
    finalSlug = `${baseSlug}-${id}`;
  }
  await prisma.category.update({
    where: { id },
    data: updateData
  });
  if (finalSlug) {
    await prisma.category.update({
      where: { id },
      data: { slug: finalSlug }
    });
  }
  return await getCategoryById(id);
};
var deleteCategory = async (id) => {
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) {
    throw new AppError_default(httpStatus2.NOT_FOUND, "Category not found");
  }
  await prisma.category.update({
    where: { id },
    data: {
      isDeleted: true,
      deletedAt: /* @__PURE__ */ new Date()
    }
  });
  return { message: "Category soft deleted successfully" };
};
var deleteCategoryPermanently = async (id) => {
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) {
    throw new AppError_default(httpStatus2.NOT_FOUND, "Category not found");
  }
  const ideaCategoryCount = await prisma.ideaCategory.count({
    where: { categoryId: id }
  });
  if (ideaCategoryCount > 0) {
    throw new AppError_default(httpStatus2.BAD_REQUEST, "Cannot permanently delete category associated with ideas");
  }
  if (category.icon) {
    await deleteFileFromCloudinary(category.icon);
  }
  await prisma.category.delete({ where: { id } });
  return { message: "Category permanently deleted from system" };
};
var CategoryService = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  deleteCategoryPermanently
};

// src/app/module/category/category.controller.ts
var getAllCategories2 = catchAsync(async (req, res) => {
  const result = await CategoryService.getAllCategories(req.query);
  sendResponse(res, {
    httpStatusCode: status8.OK,
    success: true,
    message: "Categories fetched successfully",
    data: result.data,
    meta: result.meta
  });
});
var getCategoryById2 = catchAsync(async (req, res) => {
  const id = String(req.params.id);
  const category = await CategoryService.getCategoryById(id);
  sendResponse(res, {
    httpStatusCode: status8.OK,
    success: true,
    message: "Category fetched successfully",
    data: category
  });
});
var createCategory2 = catchAsync(async (req, res) => {
  const payload = {
    ...req.body,
    icon: req.file?.path
  };
  const category = await CategoryService.createCategory(payload);
  sendResponse(res, {
    httpStatusCode: status8.CREATED,
    success: true,
    message: "Category created successfully",
    data: category
  });
});
var updateCategory2 = catchAsync(async (req, res) => {
  const id = String(req.params.id);
  const payload = {
    ...req.body,
    icon: req.file?.path
  };
  const updated = await CategoryService.updateCategory(id, payload);
  sendResponse(res, {
    httpStatusCode: status8.OK,
    success: true,
    message: "Category updated successfully",
    data: updated
  });
});
var deleteCategory2 = catchAsync(async (req, res) => {
  const id = String(req.params.id);
  const userRole = req.user?.role;
  const isPermanent = req.query?.permanent === "true";
  let result;
  if (isPermanent && (userRole === Role.ADMIN || userRole === Role.SUPER_ADMIN)) {
    result = await CategoryService.deleteCategoryPermanently(id);
  } else {
    result = await CategoryService.deleteCategory(id);
  }
  sendResponse(res, {
    httpStatusCode: status8.OK,
    success: true,
    message: result.message
  });
});
var CategoryController = {
  getAllCategories: getAllCategories2,
  getCategoryById: getCategoryById2,
  createCategory: createCategory2,
  updateCategory: updateCategory2,
  deleteCategory: deleteCategory2
};

// src/app/module/category/category.validator.ts
import z3 from "zod";
var createCategoryZodSchema = z3.object({
  name: z3.string().min(2, "Name must be at least 2 characters long"),
  slug: z3.string().min(2, "Slug must be at least 2 characters long").optional(),
  description: z3.string().max(500, "Description must be 500 characters or less").optional(),
  icon: z3.string().optional(),
  color: z3.string().min(3, "Color must be a valid color").optional(),
  isActive: z3.boolean().optional()
});
var updateCategoryZodSchema = z3.object({
  name: z3.string().min(2, "Name must be at least 2 characters long").optional(),
  slug: z3.string().min(2, "Slug must be at least 2 characters long").optional(),
  description: z3.string().max(500, "Description must be 500 characters or less").optional(),
  icon: z3.string().optional(),
  color: z3.string().min(3, "Color must be a valid color").optional(),
  isActive: z3.boolean().optional()
});

// src/app/module/category/category.route.ts
var router3 = Router3();
router3.get("/", CategoryController.getAllCategories);
router3.get("/:id", CategoryController.getCategoryById);
router3.post("/", multerUpload.single("file"), checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.MODERATOR), validateRequest(createCategoryZodSchema), CategoryController.createCategory);
router3.patch("/:id", multerUpload.single("file"), checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.MODERATOR), validateRequest(updateCategoryZodSchema), CategoryController.updateCategory);
router3.delete("/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), CategoryController.deleteCategory);
var CategoryRoutes = router3;

// src/app/module/tag/tag.route.ts
import { Router as Router4 } from "express";

// src/app/module/tag/tag.controller.ts
import status9 from "http-status";

// src/app/module/tag/tag.service.ts
import httpStatus3 from "http-status";

// src/app/module/tag/tag.constant.ts
var tagSearchableFields = [
  "id",
  "name",
  "slug"
];
var tagFilterableFields = [
  "id",
  "name",
  "slug"
];
var tagIncludeConfig = {
  ideas: true
};

// src/app/module/tag/tag.service.ts
var getAllTags = async (query) => {
  const tagQuery = new QueryBuilder(
    prisma.tag,
    query,
    {
      searchableFields: tagSearchableFields,
      filterableFields: tagFilterableFields
    }
  ).search().filter().paginate().sort().fields().dynamicInclude(tagIncludeConfig);
  const result = await tagQuery.execute();
  return result;
};
var getTagById = async (id) => {
  const tag = await prisma.tag.findUnique({
    where: { id }
  });
  if (!tag) {
    throw new AppError_default(httpStatus3.NOT_FOUND, "Tag not found");
  }
  return tag;
};
var createTag = async (payload) => {
  const { name, slug } = payload;
  const baseSlug = normalizeSlug(slug ?? name);
  const existing = await prisma.tag.findFirst({
    where: {
      OR: [
        { name },
        { slug: baseSlug }
      ]
    }
  });
  if (existing) {
    if (existing.name === name) {
      throw new AppError_default(httpStatus3.CONFLICT, "Tag name already exists");
    } else {
      throw new AppError_default(httpStatus3.CONFLICT, "Tag slug already exists");
    }
  }
  const tag = await prisma.tag.create({
    data: {
      name,
      slug: baseSlug
    }
  });
  const finalSlug = `${baseSlug}-${tag.id}`;
  const updatedTag = await prisma.tag.update({
    where: { id: tag.id },
    data: { slug: finalSlug }
  });
  return updatedTag;
};
var updateTag = async (id, payload) => {
  const tag = await prisma.tag.findUnique({ where: { id } });
  if (!tag) {
    throw new AppError_default(httpStatus3.NOT_FOUND, "Tag not found");
  }
  const { name, slug } = payload;
  if (name || slug) {
    const orConditions = [];
    if (name) orConditions.push({ name });
    if (slug) orConditions.push({ slug: normalizeSlug(slug) });
    const existing = await prisma.tag.findFirst({
      where: {
        AND: [
          { id: { not: id } },
          { OR: orConditions }
        ]
      }
    });
    if (existing) {
      if (name && existing.name === name) {
        throw new AppError_default(httpStatus3.CONFLICT, "Tag name already exists");
      } else {
        throw new AppError_default(httpStatus3.CONFLICT, "Tag slug already exists");
      }
    }
  }
  const updateData = {};
  if (name) updateData.name = name;
  let finalSlug;
  if (slug || name) {
    const baseSlug = normalizeSlug(slug ?? name);
    finalSlug = `${baseSlug}-${id}`;
  }
  await prisma.tag.update({
    where: { id },
    data: updateData
  });
  if (finalSlug) {
    await prisma.tag.update({
      where: { id },
      data: { slug: finalSlug }
    });
  }
  return await getTagById(id);
};
var deleteTag = async (id) => {
  const tag = await prisma.tag.findUnique({ where: { id } });
  if (!tag) {
    throw new AppError_default(httpStatus3.NOT_FOUND, "Tag not found");
  }
  await prisma.tag.update({
    where: { id },
    data: {
      isDeleted: true,
      deletedAt: /* @__PURE__ */ new Date()
    }
  });
  return { message: "Tag soft deleted successfully" };
};
var deleteTagPermanently = async (id) => {
  const tag = await prisma.tag.findUnique({ where: { id } });
  if (!tag) {
    throw new AppError_default(httpStatus3.NOT_FOUND, "Tag not found");
  }
  const ideaTagCount = await prisma.ideaTag.count({
    where: { tagId: id }
  });
  if (ideaTagCount > 0) {
    throw new AppError_default(httpStatus3.BAD_REQUEST, "Cannot permanently delete tag associated with ideas");
  }
  await prisma.tag.delete({ where: { id } });
  return { message: "Tag permanently deleted from system" };
};
var TagService = {
  getAllTags,
  getTagById,
  createTag,
  updateTag,
  deleteTag,
  deleteTagPermanently
};

// src/app/module/tag/tag.controller.ts
var getAllTags2 = catchAsync(async (req, res) => {
  const result = await TagService.getAllTags(req.query);
  sendResponse(res, {
    httpStatusCode: status9.OK,
    success: true,
    message: "Tags fetched successfully",
    data: result.data,
    meta: result.meta
  });
});
var getTagById2 = catchAsync(async (req, res) => {
  const id = String(req.params.id);
  const tag = await TagService.getTagById(id);
  sendResponse(res, {
    httpStatusCode: status9.OK,
    success: true,
    message: "Tag fetched successfully",
    data: tag
  });
});
var createTag2 = catchAsync(async (req, res) => {
  const payload = req.body;
  const tag = await TagService.createTag(payload);
  sendResponse(res, {
    httpStatusCode: status9.CREATED,
    success: true,
    message: "Tag created successfully",
    data: tag
  });
});
var updateTag2 = catchAsync(async (req, res) => {
  const id = String(req.params.id);
  const payload = req.body;
  const tag = await TagService.updateTag(id, payload);
  sendResponse(res, {
    httpStatusCode: status9.OK,
    success: true,
    message: "Tag updated successfully",
    data: tag
  });
});
var deleteTag2 = catchAsync(async (req, res) => {
  const id = String(req.params.id);
  const userRole = req.user?.role;
  const isPermanent = req.query?.permanent === "true";
  let result;
  if (isPermanent && (userRole === Role.ADMIN || userRole === Role.SUPER_ADMIN)) {
    result = await TagService.deleteTagPermanently(id);
  } else {
    result = await TagService.deleteTag(id);
  }
  sendResponse(res, {
    httpStatusCode: status9.OK,
    success: true,
    message: result.message
  });
});
var TagController = {
  getAllTags: getAllTags2,
  getTagById: getTagById2,
  createTag: createTag2,
  updateTag: updateTag2,
  deleteTag: deleteTag2
};

// src/app/module/tag/tag.validator.ts
import z4 from "zod";
var createTagZodSchema = z4.object({
  name: z4.string().min(2, "Name must be at least 2 characters long"),
  slug: z4.string().min(2, "Slug must be at least 2 characters long").optional()
});
var updateTagZodSchema = z4.object({
  name: z4.string().min(2, "Name must be at least 2 characters long").optional(),
  slug: z4.string().min(2, "Slug must be at least 2 characters long").optional()
});

// src/app/module/tag/tag.route.ts
var router4 = Router4();
router4.get("/", TagController.getAllTags);
router4.get("/:id", TagController.getTagById);
router4.post("/", checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.MODERATOR), validateRequest(createTagZodSchema), TagController.createTag);
router4.patch("/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), validateRequest(updateTagZodSchema), TagController.updateTag);
router4.delete("/:id", checkAuth(Role.SUPER_ADMIN), TagController.deleteTag);
var TagRoutes = router4;

// src/app/module/Idea/idea.route.ts
import express from "express";

// src/app/module/Idea/idea.controller.ts
import httpStatus5 from "http-status";

// src/app/module/Idea/idea.service.ts
import httpStatus4 from "http-status";

// src/app/module/Idea/idea.constant.ts
var ideaSearchableFields = [
  "id",
  "title",
  "description",
  "problemStatement",
  "proposedSolution",
  "author.name",
  "categories.category.name",
  "tags.tag.name"
];
var ideaFilterableFields = [
  "id",
  "authorId",
  "status",
  "isPaid",
  "price",
  "isFeatured",
  "categories.category.name",
  "categories.category.id",
  "categories.category.slug",
  "tags.tag.name",
  "tags.tag.id",
  "tags.tag.slug",
  "createdAt",
  "updatedAt",
  "isDeleted",
  "viewCount",
  "upvoteCount",
  "downvoteCount",
  "trendingScore"
];
var ideaIncludeConfig = {
  author: {
    select: {
      id: true,
      name: true,
      email: true,
      image: true
    }
  },
  categories: {
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
          icon: true,
          color: true
        }
      }
    }
  },
  tags: {
    include: {
      tag: {
        select: {
          id: true,
          name: true,
          slug: true
        }
      }
    }
  },
  attachments: true,
  _count: {
    select: {
      comments: true,
      votes: true,
      purchases: true,
      watchlists: true
    }
  }
};

// src/generated/prisma/internal/prismaNamespaceBrowser.ts
import * as runtime3 from "@prisma/client/runtime/index-browser";
var NullTypes4 = {
  DbNull: runtime3.NullTypes.DbNull,
  JsonNull: runtime3.NullTypes.JsonNull,
  AnyNull: runtime3.NullTypes.AnyNull
};
var TransactionIsolationLevel2 = runtime3.makeStrictEnum({
  ReadUncommitted: "ReadUncommitted",
  ReadCommitted: "ReadCommitted",
  RepeatableRead: "RepeatableRead",
  Serializable: "Serializable"
});

// src/app/module/Idea/idea.service.ts
var getAllIdeas = async (queryParams) => {
  const ideaQuery = new QueryBuilder(prisma.idea, queryParams, {
    searchableFields: ideaSearchableFields,
    filterableFields: ideaFilterableFields
  }).search().filter().paginate().sort().dynamicInclude(ideaIncludeConfig, Object.keys(ideaIncludeConfig));
  return await ideaQuery.execute();
};
var getMyIdeas = async (authorId, queryParams) => {
  const ideaQuery = new QueryBuilder(prisma.idea, queryParams, {
    searchableFields: ideaSearchableFields,
    filterableFields: ideaFilterableFields
  }).where({ authorId, isDeleted: false }).search().filter().paginate().sort().dynamicInclude(ideaIncludeConfig, Object.keys(ideaIncludeConfig));
  return await ideaQuery.execute();
};
var getIdeaById = async (id, includeDeleted = false) => {
  await prisma.idea.update({
    where: { id },
    data: {
      viewCount: { increment: 1 }
    }
  });
  const idea = await prisma.idea.findUnique({
    where: { id },
    include: {
      categories: {
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
              icon: true,
              color: true
            }
          }
        }
      },
      tags: {
        include: {
          tag: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          }
        }
      },
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          _count: {
            select: {
              followers: true,
              following: true
            }
          }
        }
      },
      comments: true,
      votes: true,
      watchlists: true,
      attachments: true,
      _count: {
        select: {
          comments: true,
          votes: true,
          purchases: true,
          watchlists: true
        }
      }
    }
  });
  if (!idea || !includeDeleted && idea.isDeleted) {
    throw new AppError_default(httpStatus4.NOT_FOUND, "Idea not found");
  }
  return idea;
};
var createIdea = async (payload, authorId) => {
  const { title, slug, description, problemStatement, proposedSolution, images, categories, tags, status: status17, isPaid, price, isFeatured } = payload;
  const baseSlug = normalizeSlug(slug ?? title);
  const existing = await prisma.idea.findFirst({
    where: { slug: baseSlug }
  });
  if (existing) {
    throw new AppError_default(httpStatus4.CONFLICT, "Idea slug already exists");
  }
  if (categories && categories.length > 0) {
    const categoryCount = await prisma.category.count({
      where: { id: { in: categories } }
    });
    if (categoryCount !== categories.length) {
      throw new AppError_default(httpStatus4.BAD_REQUEST, "One or more category IDs are invalid");
    }
  }
  if (tags && tags.length > 0) {
    const tagCount = await prisma.tag.count({
      where: { id: { in: tags } }
    });
    if (tagCount !== tags.length) {
      throw new AppError_default(httpStatus4.BAD_REQUEST, "One or more tag IDs are invalid");
    }
  }
  const result = await prisma.$transaction(async (tx) => {
    const idea = await tx.idea.create({
      data: {
        title,
        slug: baseSlug,
        // Temporary slug
        description,
        problemStatement,
        proposedSolution,
        images: images ?? [],
        authorId,
        status: status17 ?? "DRAFT",
        isPaid: isPaid ?? false,
        price: price ?? 0,
        isFeatured: isFeatured ?? false
      }
    });
    const finalSlug = `${baseSlug}-${idea.id}`;
    const updatedIdea = await tx.idea.update({
      where: { id: idea.id },
      data: { slug: finalSlug }
    });
    if (categories && categories.length > 0) {
      await tx.ideaCategory.createMany({
        data: categories.map((categoryId) => ({
          ideaId: idea.id,
          categoryId
        }))
      });
    }
    if (tags && tags.length > 0) {
      await tx.ideaTag.createMany({
        data: tags.map((tagId) => ({
          ideaId: idea.id,
          tagId
        }))
      });
    }
    return updatedIdea;
  });
  return await getIdeaById(result.id);
};
var updateIdea = async (id, payload, authorId, userRole) => {
  const idea = await prisma.idea.findUnique({ where: { id } });
  if (!idea) {
    throw new AppError_default(httpStatus4.NOT_FOUND, "Idea not found");
  }
  if (idea.authorId !== authorId) {
    if (userRole !== Role.ADMIN && userRole !== Role.SUPER_ADMIN) {
      throw new AppError_default(httpStatus4.FORBIDDEN, "You can only update your own ideas");
    }
  }
  const { title, slug, description, problemStatement, proposedSolution, images, categories, tags, status: status17, isPaid, price, isFeatured, adminFeedback } = payload;
  if (categories && categories.length > 0) {
    const categoryCount = await prisma.category.count({
      where: { id: { in: categories } }
    });
    if (categoryCount !== categories.length) {
      throw new AppError_default(httpStatus4.BAD_REQUEST, "One or more category IDs are invalid");
    }
  }
  if (tags && tags.length > 0) {
    const tagCount = await prisma.tag.count({
      where: { id: { in: tags } }
    });
    if (tagCount !== tags.length) {
      throw new AppError_default(httpStatus4.BAD_REQUEST, "One or more tag IDs are invalid");
    }
  }
  let finalSlug;
  if (slug || title) {
    const baseSlug = normalizeSlug(slug ?? title);
    finalSlug = `${baseSlug}-${id}`;
    const existing = await prisma.idea.findFirst({
      where: { slug: finalSlug, id: { not: id } }
    });
    if (existing) {
      throw new AppError_default(httpStatus4.CONFLICT, "Idea slug already exists");
    }
  }
  const updateData = {};
  if (title) updateData.title = title;
  if (description) updateData.description = description;
  if (problemStatement) updateData.problemStatement = problemStatement;
  if (proposedSolution) updateData.proposedSolution = proposedSolution;
  if (adminFeedback) updateData.adminFeedback = adminFeedback;
  if (images !== void 0) {
    const currentImages = idea.images || [];
    const removedImages = currentImages.filter((img) => !images.includes(img));
    if (removedImages.length > 0) {
      await Promise.all(removedImages.map((url) => deleteFileFromCloudinary(url)));
    }
    updateData.images = images;
  }
  if (status17) updateData.status = status17;
  if (isPaid !== void 0) updateData.isPaid = isPaid;
  if (price !== void 0) updateData.price = price;
  if (isFeatured !== void 0) updateData.isFeatured = isFeatured;
  if (finalSlug) updateData.slug = finalSlug;
  await prisma.$transaction(async (tx) => {
    await tx.idea.update({
      where: { id },
      data: updateData
    });
    if (categories !== void 0) {
      await tx.ideaCategory.deleteMany({
        where: { ideaId: id }
      });
      if (categories.length > 0) {
        await tx.ideaCategory.createMany({
          data: categories.map((categoryId) => ({
            ideaId: id,
            categoryId
          }))
        });
      }
    }
    if (tags !== void 0) {
      await tx.ideaTag.deleteMany({
        where: { ideaId: id }
      });
      if (tags.length > 0) {
        await tx.ideaTag.createMany({
          data: tags.map((tagId) => ({
            ideaId: id,
            tagId
          }))
        });
      }
    }
  });
  return await getIdeaById(id);
};
var deleteIdea = async (id, authorId) => {
  const idea = await prisma.idea.findUnique({ where: { id } });
  if (!idea) {
    throw new AppError_default(httpStatus4.NOT_FOUND, "Idea not found");
  }
  if (authorId !== "SUPER_ADMIN_BYPASS" && idea.authorId !== authorId) {
    throw new AppError_default(httpStatus4.FORBIDDEN, "You can only delete your own ideas");
  }
  await prisma.idea.update({
    where: { id },
    data: {
      isDeleted: true,
      deletedAt: /* @__PURE__ */ new Date()
    }
  });
  return { message: "Idea soft deleted successfully" };
};
var deleteIdeaPermanently = async (id) => {
  const idea = await prisma.idea.findUnique({ where: { id } });
  if (!idea) {
    throw new AppError_default(httpStatus4.NOT_FOUND, "Idea not found");
  }
  if (idea.images && idea.images.length > 0) {
    await Promise.all(idea.images.map((url) => deleteFileFromCloudinary(url)));
  }
  await prisma.idea.delete({ where: { id } });
  return { message: "Idea permanently deleted from system" };
};
var getSoldIdeas = async (userId) => {
  return await prisma.ideaPurchase.findMany({
    ...userId ? { where: { userId } } : {},
    include: {
      idea: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true
        }
      }
    },
    orderBy: {
      purchasedAt: "desc"
    }
  });
};
var getMyPurchases = async (userId) => {
  return await prisma.ideaPurchase.findMany({
    where: {
      userId
    },
    include: {
      idea: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true
        }
      }
    },
    orderBy: {
      purchasedAt: "desc"
    }
  });
};
var IdeaService = {
  getAllIdeas,
  getMyIdeas,
  getIdeaById,
  createIdea,
  updateIdea,
  deleteIdea,
  deleteIdeaPermanently,
  getSoldIdeas,
  getMyPurchases
};

// src/app/config/stripe.config.ts
import Stripe from "stripe";
var stripe = new Stripe(envVars.STRIPE.STRIPE_SECRET_KEY);

// src/app/module/payment/payment.utils.ts
import PDFDocument from "pdfkit";
var generateInvoicePdf = async (data) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margin: 50
      });
      const chunks = [];
      doc.on("data", (chunk) => {
        chunks.push(chunk);
      });
      doc.on("end", () => {
        resolve(Buffer.concat(chunks));
      });
      doc.on("error", (error) => {
        reject(error);
      });
      doc.fontSize(24).font("Helvetica-Bold").text("INVOICE", {
        align: "center"
      });
      doc.moveDown(0.5);
      doc.fontSize(10).font("Helvetica").text("EcoVault", {
        align: "center"
      });
      doc.text("Empowering Ideas, Cultivating the Future", { align: "center" });
      doc.moveDown(1);
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(1);
      doc.fontSize(11).font("Helvetica-Bold").text("Invoice Information");
      doc.fontSize(10).font("Helvetica").text(`Invoice ID: ${data.invoiceId}`).text(`Payment Date: ${new Date(data.paymentDate).toLocaleDateString()}`).text(`Transaction ID: ${data.transactionId}`);
      doc.moveDown(0.8);
      doc.fontSize(11).font("Helvetica-Bold").text("Buyer Information");
      doc.fontSize(10).font("Helvetica").text(`Name: ${data.userName}`).text(`Email: ${data.userEmail}`);
      doc.moveDown(0.8);
      doc.fontSize(11).font("Helvetica-Bold").text("Idea Details");
      doc.fontSize(10).font("Helvetica").text(`Title: ${data.ideaTitle}`);
      doc.moveDown(1);
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(1);
      const tableTop = doc.y;
      const col1X = 50;
      const col2X = 450;
      doc.fontSize(11).font("Helvetica-Bold").text("Payment Summary", col1X, tableTop);
      doc.moveDown(0.8);
      const headerY = doc.y;
      doc.fontSize(10).font("Helvetica-Bold");
      doc.text("Description", col1X, headerY);
      doc.text("Amount", col2X, headerY, { align: "right" });
      doc.moveTo(col1X, doc.y).lineTo(col2X + 80, doc.y).stroke();
      doc.moveDown(0.5);
      const amountY = doc.y;
      doc.fontSize(10).font("Helvetica");
      doc.text("Idea Purchase Fee", col1X, amountY);
      doc.text(`$${data.amount.toFixed(2)}`, col2X, amountY, { align: "right" });
      doc.moveDown(0.8);
      const totalY = doc.y;
      doc.fontSize(11).font("Helvetica-Bold");
      doc.text("Total Amount", col1X, totalY);
      doc.text(`$${data.amount.toFixed(2)}`, col2X, totalY, { align: "right" });
      doc.moveTo(col1X, doc.y).lineTo(col2X + 80, doc.y).stroke();
      doc.moveDown(1.5);
      doc.fontSize(9).font("Helvetica").text(
        "Thank you for your purchase. This is an electronically generated invoice.",
        {
          align: "center"
        }
      );
      doc.text("If you have any questions, please contact us at support@ecovault.com", {
        align: "center"
      });
      doc.text("Payment processed securely through Stripe", {
        align: "center"
      });
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

// src/app/module/payment/payment.service.ts
var handlerStripeWebhookEvent = async (event) => {
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const isSubscriptionCheck = session.metadata?.isSubscriptionCheck === "true";
    if (isSubscriptionCheck) {
      const paymentId2 = session.metadata?.paymentId;
      const subscriptionPlanId = session.metadata?.subscriptionPlanId;
      const userId2 = session.metadata?.userId;
      if (!paymentId2 || !subscriptionPlanId || !userId2) {
        console.error("\u26A0\uFE0F Missing metadata in webhook event for subscription");
        return { message: "Missing metadata for subscription" };
      }
      const payment2 = await prisma.payment.findUnique({ where: { id: paymentId2 } });
      if (!payment2) return { message: "Payment not found" };
      if (payment2.status === PaymentStatus.COMPLETED) return { message: "Payment already processed" };
      const user2 = await prisma.user.findUnique({ where: { id: userId2 } });
      const plan = await prisma.subscriptionPlan.findUnique({ where: { id: subscriptionPlanId } });
      if (!user2 || !plan) return { message: "User or Plan not found" };
      const result2 = await prisma.$transaction(async (tx) => {
        const updatedPayment = await tx.payment.update({
          where: { id: paymentId2 },
          data: {
            status: session.payment_status === "paid" ? PaymentStatus.COMPLETED : PaymentStatus.FAILED,
            paymentGatewayData: session,
            transactionId: session.payment_intent || event.id
          }
        });
        if (session.payment_status === "paid") {
          await tx.subscription.upsert({
            where: { userId: userId2 },
            update: {
              tier: plan.tier,
              subscriptionPlanId: plan.id,
              paymentId: updatedPayment.id,
              startDate: /* @__PURE__ */ new Date(),
              endDate: new Date(Date.now() + plan.durationDays * 24 * 60 * 60 * 1e3),
              isActive: true
            },
            create: {
              userId: userId2,
              tier: plan.tier,
              subscriptionPlanId: plan.id,
              paymentId: updatedPayment.id,
              startDate: /* @__PURE__ */ new Date(),
              endDate: new Date(Date.now() + plan.durationDays * 24 * 60 * 60 * 1e3),
              isActive: true
            }
          });
        } else if (session.payment_status === "unpaid") {
          await tx.subscription.delete({
            where: { userId: userId2 }
          });
        }
        return updatedPayment;
      });
      console.log("result", session.payment_status);
      if (session.payment_status === "paid") {
        try {
          console.log("result", session.payment_status);
          if (user2.role === Role.MEMBER) {
            console.log("result", session.payment_status);
            await prisma.user.update({
              where: { id: userId2 },
              data: {
                role: Role.MODERATOR
              }
            });
            await prisma.moderator.create({
              data: {
                userId: userId2,
                name: user2.name,
                email: user2.email
              }
            });
          }
          const pdfBuffer2 = await generateInvoicePdf({
            invoiceId: paymentId2,
            userName: user2.name,
            userEmail: user2.email,
            ideaTitle: plan.name,
            amount: result2.amount,
            transactionId: result2.transactionId || "",
            paymentDate: (/* @__PURE__ */ new Date()).toISOString()
          });
          const cloudinaryResponse = await uploadFileToCloudinary(
            pdfBuffer2,
            `ecovault/invoices/subscription-${paymentId2}-${Date.now()}.pdf`
          );
          const invoiceUrl2 = cloudinaryResponse?.secure_url || null;
          await sendEmail({
            to: user2.email,
            subject: `Subscription Confirmation & Invoice - ${plan.name}`,
            templateName: "invoice",
            templateData: {
              userName: user2.name,
              invoiceId: paymentId2,
              transactionId: result2.transactionId || "",
              paymentDate: (/* @__PURE__ */ new Date()).toLocaleDateString(),
              ideaTitle: plan.name,
              amount: result2.amount,
              invoiceUrl: invoiceUrl2
            },
            attachments: [
              {
                filename: `Subscription-Invoice-${paymentId2}.pdf`,
                content: pdfBuffer2,
                contentType: "application/pdf"
              }
            ]
          });
          console.log(`\u2705 Invoice email sent to ${user2.email} for subscription`);
        } catch (error) {
          console.error("\u274C Error generating/uploading/sending invoice PDF for subscription:", error);
        }
      }
      console.log(`\u2705 Subscription Payment ${session.payment_status} for user ${userId2}`);
      return { message: `Subscription Webhook Event ${event.id} processed successfully` };
    }
    const paymentId = session.metadata?.paymentId;
    const ideaId = session.metadata?.ideaId;
    const userId = session.metadata?.userId;
    if (!paymentId || !ideaId || !userId) {
      console.error("\u26A0\uFE0F Missing metadata in webhook event");
      return { message: "Missing metadata" };
    }
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId }
    });
    if (!payment) {
      console.error(`\u26A0\uFE0F Payment ${paymentId} not found.`);
      return { message: "Payment not found" };
    }
    if (payment.status === PaymentStatus.COMPLETED) {
      console.log(`Payment ${paymentId} already processed. Skipping`);
      return { message: `Payment ${paymentId} already processed. Skipping` };
    }
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const idea = await prisma.idea.findUnique({ where: { id: ideaId } });
    if (!user || !idea) {
      console.error(`\u26A0\uFE0F User ${userId} or Idea ${ideaId} not found.`);
      return { message: "User or Idea not found" };
    }
    if (idea.authorId === userId) {
      console.error(`\u26A0\uFE0F User ${userId} is the author of idea ${ideaId}. Cannot purchase own idea.`);
      return { message: "User cannot purchase their own idea" };
    }
    const existingPurchase = await prisma.ideaPurchase.findUnique({
      where: {
        userId_ideaId: {
          userId,
          ideaId
        }
      }
    });
    if (existingPurchase) {
      console.error(`\u26A0\uFE0F User ${userId} already purchased idea ${ideaId}`);
      return { message: "Idea already purchased by this user" };
    }
    let pdfBuffer = null;
    let invoiceUrl = null;
    const result = await prisma.$transaction(async (tx) => {
      const updatedPayment = await tx.payment.update({
        where: {
          id: paymentId
        },
        data: {
          status: session.payment_status === "paid" ? PaymentStatus.COMPLETED : PaymentStatus.FAILED,
          paymentGatewayData: session,
          transactionId: session.payment_intent || event.id
          // Use payment_intent or event.id as transactionId
        }
      });
      let newPurchase = null;
      if (session.payment_status === "paid") {
        newPurchase = await tx.ideaPurchase.create({
          data: {
            userId,
            ideaId,
            amount: updatedPayment.amount,
            paymentId
          }
        });
      }
      return { updatedPayment, newPurchase };
    });
    if (session.payment_status === "paid") {
      try {
        pdfBuffer = await generateInvoicePdf({
          invoiceId: paymentId,
          userName: user.name,
          userEmail: user.email,
          ideaTitle: idea.title,
          amount: result.updatedPayment.amount,
          transactionId: result.updatedPayment.transactionId || "",
          paymentDate: (/* @__PURE__ */ new Date()).toISOString()
        });
        const cloudinaryResponse = await uploadFileToCloudinary(
          pdfBuffer,
          `ecovault/invoices/invoice-${paymentId}-${Date.now()}.pdf`
        );
        invoiceUrl = cloudinaryResponse?.secure_url || null;
        console.log(`\u2705 Invoice PDF generated and uploaded for payment ${paymentId}`);
      } catch (pdfError) {
        console.error("\u274C Error generating/uploading invoice PDF:", pdfError);
      }
    }
    if (session.payment_status === "paid" && pdfBuffer) {
      try {
        await sendEmail({
          to: user.email,
          subject: `Payment Confirmation & Invoice - ${idea.title}`,
          templateName: "invoice",
          templateData: {
            userName: user.name,
            invoiceId: paymentId,
            transactionId: result.updatedPayment.transactionId || "",
            paymentDate: (/* @__PURE__ */ new Date()).toLocaleDateString(),
            ideaTitle: idea.title,
            amount: payment.amount,
            invoiceUrl
          },
          attachments: [
            {
              filename: `Invoice-${paymentId}.pdf`,
              content: pdfBuffer || Buffer.from(""),
              contentType: "application/pdf"
            }
          ]
        });
        console.log(`\u2705 Invoice email sent to ${user.email}`);
      } catch (emailError) {
        console.error("\u274C Error sending invoice email:", emailError);
      }
    }
    console.log(`\u2705 Payment ${session.payment_status} for idea ${ideaId}`);
  } else if (event.type === "checkout.session.expired") {
    const session = event.data.object;
    const paymentId = session.metadata?.paymentId;
    if (paymentId) {
      await prisma.payment.update({
        where: { id: paymentId },
        data: { status: PaymentStatus.FAILED }
      });
    }
    console.log(`Checkout session ${session.id} expired. Marking associated payment as failed.`);
  } else if (event.type === "payment_intent.payment_failed") {
    const session = event.data.object;
    const paymentId = session.metadata?.paymentId;
    if (paymentId) {
      await prisma.payment.update({
        where: { id: paymentId },
        data: { status: PaymentStatus.FAILED }
      });
    }
    console.log(`Payment intent ${session.id} failed. Marking associated payment as failed.`);
  } else {
    console.log(`Unhandled event type ${event.type}`);
  }
  return { message: `Webhook Event ${event.id} processed successfully` };
};
var prepareIdeaPurchase = async (userId, ideaId) => {
  const idea = await prisma.idea.findUnique({
    where: { id: ideaId }
  });
  if (!idea) {
    throw new Error("Idea not found");
  }
  if (idea.authorId === userId) {
    throw new Error("You cannot purchase your own idea");
  }
  const existingPurchase = await prisma.ideaPurchase.findUnique({
    where: {
      userId_ideaId: {
        userId,
        ideaId
      }
    }
  });
  if (existingPurchase) {
    throw new Error("Idea is already purchased by you");
  }
  const payment = await prisma.payment.create({
    data: {
      amount: idea.price || 0,
      status: PaymentStatus.PENDING,
      userId
    }
  });
  return { idea, payment };
};
var createStripeSession = async (userId, ideaId) => {
  const { idea, payment } = await prepareIdeaPurchase(userId, ideaId);
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: idea.title,
            description: `Purchase for idea: ${idea.title}`
          },
          unit_amount: Math.round((idea.price || 0) * 100)
        },
        quantity: 1
      }
    ],
    mode: "payment",
    success_url: `${envVars.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${envVars.FRONTEND_URL}/payment/cancel`,
    metadata: {
      paymentId: payment.id,
      ideaId: idea.id,
      userId
    }
  });
  return { url: session.url };
};
var createBkashSession = async (userId, ideaId) => {
  const { payment } = await prepareIdeaPurchase(userId, ideaId);
  return { url: `${envVars.FRONTEND_URL}/bkash-processing?payment_id=${payment.id}` };
};
var createSslSession = async (userId, ideaId) => {
  const { payment } = await prepareIdeaPurchase(userId, ideaId);
  return { url: `${envVars.FRONTEND_URL}/sslcommerce-processing?payment_id=${payment.id}` };
};
var createNagadSession = async (userId, ideaId) => {
  const { payment } = await prepareIdeaPurchase(userId, ideaId);
  return { url: `${envVars.FRONTEND_URL}/nagad-processing?payment_id=${payment.id}` };
};
var createCardSession = async (userId, ideaId) => {
  const { payment } = await prepareIdeaPurchase(userId, ideaId);
  return { url: `${envVars.FRONTEND_URL}/card-processing?payment_id=${payment.id}` };
};
var getMyPurchases2 = async (userId) => {
  const purchases = await prisma.ideaPurchase.findMany({
    where: {
      userId
    },
    include: {
      idea: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true
        }
      }
    },
    orderBy: {
      purchasedAt: "desc"
    }
  });
  return purchases;
};
var getAllPurchases = async () => {
  const purchases = await prisma.ideaPurchase.findMany({
    include: {
      idea: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true
        }
      }
    },
    orderBy: {
      purchasedAt: "desc"
    }
  });
  return purchases;
};
var PaymentService = {
  handlerStripeWebhookEvent,
  createStripeSession,
  createBkashSession,
  createSslSession,
  createNagadSession,
  createCardSession,
  getMyPurchases: getMyPurchases2,
  getAllPurchases
};

// src/app/module/Idea/idea.controller.ts
var getAllIdeas2 = catchAsync(async (req, res) => {
  const result = await IdeaService.getAllIdeas(req.query);
  sendResponse(res, {
    httpStatusCode: httpStatus5.OK,
    success: true,
    message: "Ideas retrieved successfully",
    data: result.data,
    meta: result.meta
  });
});
var getMyIdeas2 = catchAsync(async (req, res) => {
  const authorId = req.user?.userId;
  const result = await IdeaService.getMyIdeas(authorId, req.query);
  sendResponse(res, {
    httpStatusCode: httpStatus5.OK,
    success: true,
    message: "My ideas retrieved successfully",
    data: result.data,
    meta: result.meta
  });
});
var getIdeaById2 = catchAsync(async (req, res) => {
  const id = String(req.params.id);
  const idea = await IdeaService.getIdeaById(id);
  sendResponse(res, {
    httpStatusCode: httpStatus5.OK,
    success: true,
    message: "Idea retrieved successfully",
    data: idea
  });
});
var createIdea2 = catchAsync(async (req, res) => {
  const payload = {
    ...req.body,
    images: req.files?.map((file) => file.path) || []
  };
  const authorId = req.user?.userId;
  const idea = await IdeaService.createIdea(payload, authorId);
  sendResponse(res, {
    httpStatusCode: httpStatus5.CREATED,
    success: true,
    message: "Idea created successfully",
    data: idea
  });
});
var updateIdea2 = catchAsync(async (req, res) => {
  const id = String(req.params.id);
  const payload = {
    ...req.body
  };
  console.log(req.body);
  if (req.files && req.files.length > 0) {
    payload.images = req.files.map((file) => file.path);
  }
  const authorId = req.user?.userId;
  const userRole = req.user?.role;
  const idea = await IdeaService.updateIdea(id, payload, authorId, userRole);
  sendResponse(res, {
    httpStatusCode: httpStatus5.OK,
    success: true,
    message: "Idea updated successfully",
    data: idea
  });
});
var deleteIdea2 = catchAsync(async (req, res) => {
  const id = String(req.params.id);
  const authorId = req.user?.userId;
  const userRole = req.user?.role;
  const isPermanent = req.query?.permanent === "true";
  let result;
  if (isPermanent && (userRole === Role.ADMIN || userRole === Role.SUPER_ADMIN)) {
    result = await IdeaService.deleteIdeaPermanently(id);
  } else {
    const effectiveAuthorId = userRole === Role.ADMIN || userRole === Role.SUPER_ADMIN ? "SUPER_ADMIN_BYPASS" : authorId;
    result = await IdeaService.deleteIdea(id, effectiveAuthorId);
  }
  sendResponse(res, {
    httpStatusCode: httpStatus5.OK,
    success: true,
    message: result.message
  });
});
var getSoldIdeas2 = catchAsync(async (req, res) => {
  const userId = req.query.userId;
  const result = await IdeaService.getSoldIdeas(userId);
  sendResponse(res, {
    httpStatusCode: httpStatus5.OK,
    success: true,
    message: "Sold ideas retrieved successfully",
    data: result
  });
});
var getMyPurchases3 = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const result = await IdeaService.getMyPurchases(userId);
  sendResponse(res, {
    httpStatusCode: httpStatus5.OK,
    success: true,
    message: "My purchases retrieved successfully",
    data: result
  });
});
var purchaseIdea = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const { ideaId, paymentMethod } = req.body;
  const method = paymentMethod || "STRIPE";
  let result;
  if (method === "BKASH") {
    result = await PaymentService.createBkashSession(userId, ideaId);
  } else if (method === "SSLECOMMERCE") {
    result = await PaymentService.createSslSession(userId, ideaId);
  } else if (method === "NAGAD") {
    result = await PaymentService.createNagadSession(userId, ideaId);
  } else if (method === "CARD") {
    result = await PaymentService.createCardSession(userId, ideaId);
  } else {
    result = await PaymentService.createStripeSession(userId, ideaId);
  }
  sendResponse(res, {
    httpStatusCode: httpStatus5.OK,
    success: true,
    message: "Checkout session created successfully",
    data: result
  });
});
var IdeaController = {
  getAllIdeas: getAllIdeas2,
  getMyIdeas: getMyIdeas2,
  getIdeaById: getIdeaById2,
  createIdea: createIdea2,
  updateIdea: updateIdea2,
  deleteIdea: deleteIdea2,
  getSoldIdeas: getSoldIdeas2,
  purchaseIdea,
  getMyPurchases: getMyPurchases3
};

// src/app/module/Idea/idea.validator.ts
import z5 from "zod";
var createIdeaZodSchema = z5.object({
  title: z5.string().min(3, "Title must be at least 3 characters"),
  slug: z5.string().min(3, "Slug must be at least 3 characters").optional(),
  description: z5.string().min(10, "Description must be at least 10 characters"),
  problemStatement: z5.string().min(10, "Problem statement must be at least 10 characters"),
  proposedSolution: z5.string().min(10, "Proposed solution must be at least 10 characters"),
  images: z5.array(z5.string()).optional(),
  categories: z5.array(z5.string()).optional(),
  tags: z5.array(z5.string()).optional(),
  status: z5.enum(["DRAFT", "UNDER_REVIEW", "APPROVED", "REJECTED"]).optional(),
  isPaid: z5.boolean().optional(),
  price: z5.number().min(0).optional(),
  isFeatured: z5.boolean().optional()
});
var updateIdeaZodSchema = z5.object({
  title: z5.string().min(3, "Title must be at least 3 characters").optional(),
  slug: z5.string().min(3, "Slug must be at least 3 characters").optional(),
  description: z5.string().min(10, "Description must be at least 10 characters").optional(),
  problemStatement: z5.string().min(10, "Problem statement must be at least 10 characters").optional(),
  proposedSolution: z5.string().min(10, "Proposed solution must be at least 10 characters").optional(),
  images: z5.array(z5.string()).optional(),
  categories: z5.array(z5.string()).optional(),
  tags: z5.array(z5.string()).optional(),
  status: z5.enum(["DRAFT", "UNDER_REVIEW", "APPROVED", "REJECTED"]).optional(),
  isPaid: z5.boolean().optional(),
  price: z5.number().min(0).optional(),
  isFeatured: z5.boolean().optional(),
  adminFeedback: z5.string().optional()
});

// src/app/module/Idea/idea.route.ts
var router5 = express.Router();
router5.get("/", IdeaController.getAllIdeas);
router5.get("/my-ideas", checkAuth(Role.MEMBER, Role.MODERATOR, Role.ADMIN, Role.SUPER_ADMIN), IdeaController.getMyIdeas);
router5.get("/sold-ideas", checkAuth(Role.MODERATOR), IdeaController.getSoldIdeas);
router5.get("/my-purchases", checkAuth(Role.MEMBER), IdeaController.getMyPurchases);
router5.get("/:id", IdeaController.getIdeaById);
router5.post("/", multerUpload.array("files", 5), validateRequest(createIdeaZodSchema), checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.MODERATOR), IdeaController.createIdea);
router5.put("/:id", multerUpload.array("files", 5), validateRequest(updateIdeaZodSchema), checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.MODERATOR), IdeaController.updateIdea);
router5.delete("/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.MODERATOR), IdeaController.deleteIdea);
router5.post("/purchase", checkAuth(Role.MODERATOR, Role.MEMBER), IdeaController.purchaseIdea);
var IdeaRoutes = router5;

// src/app/module/comment/comment.route.ts
import express2 from "express";

// src/app/module/comment/comment.controller.ts
import httpStatus7 from "http-status";

// src/app/module/comment/comment.service.ts
import httpStatus6 from "http-status";

// src/app/module/comment/comment.constant.ts
var commentSearchableFields = ["content"];
var commentFilterableFields = [
  "authorId",
  "ideaId",
  "parentId",
  "isDeleted",
  "isFlagged"
];
var commentIncludeConfig = {
  author: {
    select: {
      id: true,
      name: true,
      email: true,
      image: true
    }
  },
  idea: {
    select: {
      id: true,
      title: true,
      slug: true
    }
  },
  _count: {
    select: {
      reactions: true,
      replies: true
    }
  }
};

// src/app/module/comment/comment.service.ts
var createComment = async (payload, authorId) => {
  const { content, ideaId, parentId } = payload;
  const idea = await prisma.idea.findUnique({ where: { id: ideaId } });
  if (!idea) {
    throw new AppError_default(httpStatus6.NOT_FOUND, "Idea not found");
  }
  if (parentId) {
    const parentComment = await prisma.comment.findUnique({ where: { id: parentId } });
    if (!parentComment) {
      throw new AppError_default(httpStatus6.NOT_FOUND, "Parent comment not found");
    }
  }
  const comment = await prisma.comment.create({
    data: {
      content,
      ideaId,
      authorId,
      parentId: parentId || null
    },
    include: {
      author: { select: { id: true, name: true, image: true } }
    }
  });
  return comment;
};
var getCommentsByIdea = async (ideaId) => {
  const allComments = await prisma.comment.findMany({
    where: { ideaId, isDeleted: false },
    include: {
      author: { select: { id: true, name: true, image: true } },
      reactions: true
    },
    orderBy: { createdAt: "asc" }
  });
  const map = /* @__PURE__ */ new Map();
  const roots = [];
  allComments.forEach((comment) => {
    map.set(comment.id, { ...comment, replies: [] });
  });
  allComments.forEach((comment) => {
    if (comment.parentId) {
      const parent = map.get(comment.parentId);
      if (parent) {
        parent.replies.push(map.get(comment.id));
      }
    } else {
      roots.push(map.get(comment.id));
    }
  });
  return roots;
};
var updateComment = async (id, content, authorId) => {
  const comment = await prisma.comment.findUnique({ where: { id } });
  if (!comment || comment.isDeleted) {
    throw new AppError_default(httpStatus6.NOT_FOUND, "Comment not found");
  }
  if (comment.authorId !== authorId) {
    throw new AppError_default(httpStatus6.FORBIDDEN, "You can only edit your own comments");
  }
  return await prisma.comment.update({
    where: { id },
    data: { content }
  });
};
var deleteComment = async (id, authorId, userRole) => {
  const comment = await prisma.comment.findUnique({ where: { id } });
  if (!comment) {
    throw new AppError_default(httpStatus6.NOT_FOUND, "Comment not found");
  }
  if (comment.authorId !== authorId && userRole !== "ADMIN" && userRole !== "SUPER_ADMIN" && userRole !== "MODERATOR") {
    throw new AppError_default(httpStatus6.FORBIDDEN, "You don't have permission to delete this comment");
  }
  return await prisma.comment.update({
    where: { id },
    data: { isDeleted: true }
  });
};
var toggleCommentReaction = async (payload, userId) => {
  const { commentId, type } = payload;
  const existingReaction = await prisma.commentReaction.findUnique({
    where: { userId_commentId: { userId, commentId } }
  });
  if (existingReaction) {
    if (existingReaction.type === type) {
      await prisma.commentReaction.delete({
        where: { userId_commentId: { userId, commentId } }
      });
      return { action: "removed" };
    } else {
      await prisma.commentReaction.update({
        where: { userId_commentId: { userId, commentId } },
        data: { type }
      });
      return { action: "updated" };
    }
  }
  await prisma.commentReaction.create({
    data: { userId, commentId, type }
  });
  return { action: "added" };
};
var getAllCommentsFromDb = async (queryParams) => {
  const commentQuery = new QueryBuilder(prisma.comment, queryParams, {
    searchableFields: commentSearchableFields,
    filterableFields: commentFilterableFields
  }).search().filter().paginate().sort().dynamicInclude(commentIncludeConfig, Object.keys(commentIncludeConfig));
  return await commentQuery.execute();
};
var CommentService = {
  createComment,
  getCommentsByIdea,
  updateComment,
  deleteComment,
  toggleCommentReaction,
  getAllCommentsFromDb
};

// src/app/module/comment/comment.controller.ts
var createComment2 = catchAsync(async (req, res) => {
  const authorId = req.user.userId;
  const comment = await CommentService.createComment(req.body, authorId);
  sendResponse(res, {
    httpStatusCode: httpStatus7.CREATED,
    success: true,
    message: "Comment created successfully",
    data: comment
  });
});
var getCommentsByIdea2 = catchAsync(async (req, res) => {
  const ideaId = req.params.ideaId;
  const comments = await CommentService.getCommentsByIdea(ideaId);
  sendResponse(res, {
    httpStatusCode: httpStatus7.OK,
    success: true,
    message: "Comments retrieved successfully",
    data: comments
  });
});
var updateComment2 = catchAsync(async (req, res) => {
  const authorId = req.user.userId;
  const id = req.params.id;
  const comment = await CommentService.updateComment(id, req.body.content, authorId);
  sendResponse(res, {
    httpStatusCode: httpStatus7.OK,
    success: true,
    message: "Comment updated successfully",
    data: comment
  });
});
var deleteComment2 = catchAsync(async (req, res) => {
  const authorId = req.user.userId;
  const userRole = req.user.role;
  const id = req.params.id;
  const result = await CommentService.deleteComment(id, authorId, userRole);
  sendResponse(res, {
    httpStatusCode: httpStatus7.OK,
    success: true,
    message: "Comment deleted successfully",
    data: result
  });
});
var toggleCommentReaction2 = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const result = await CommentService.toggleCommentReaction(req.body, userId);
  sendResponse(res, {
    httpStatusCode: httpStatus7.OK,
    success: true,
    message: `Comment reaction ${result.action} successfully`,
    data: result
  });
});
var getAllComments = catchAsync(async (req, res) => {
  const queryParams = req.query;
  const result = await CommentService.getAllCommentsFromDb(queryParams);
  sendResponse(res, {
    httpStatusCode: httpStatus7.OK,
    success: true,
    message: "All comments retrieved successfully",
    data: result
  });
});
var CommentController = {
  createComment: createComment2,
  getCommentsByIdea: getCommentsByIdea2,
  updateComment: updateComment2,
  deleteComment: deleteComment2,
  toggleCommentReaction: toggleCommentReaction2,
  getAllComments
};

// src/app/module/comment/comment.validator.ts
import { z as z6 } from "zod";
var createCommentZodSchema = z6.object({
  content: z6.string().min(1, "Content is required"),
  ideaId: z6.string().min(1, "Idea ID is required"),
  parentId: z6.string().optional()
});
var updateCommentZodSchema = z6.object({
  content: z6.string().min(1, "Content string is required")
});
var commentReactionZodSchema = z6.object({
  commentId: z6.string().min(1, "Comment ID is required"),
  type: z6.enum(Object.values(ReactionType))
});

// src/app/module/comment/comment.route.ts
var router6 = express2.Router();
router6.get("/idea/:ideaId", CommentController.getCommentsByIdea);
router6.get("/", CommentController.getAllComments);
router6.post(
  "/",
  checkAuth(Role.MEMBER, Role.MODERATOR, Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(createCommentZodSchema),
  CommentController.createComment
);
router6.patch(
  "/:id",
  checkAuth(Role.MEMBER, Role.MODERATOR, Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(updateCommentZodSchema),
  CommentController.updateComment
);
router6.delete(
  "/:id",
  checkAuth(Role.MEMBER, Role.MODERATOR, Role.ADMIN, Role.SUPER_ADMIN),
  CommentController.deleteComment
);
router6.post(
  "/react",
  checkAuth(Role.MEMBER, Role.MODERATOR, Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(commentReactionZodSchema),
  CommentController.toggleCommentReaction
);
var CommentRoutes = router6;

// src/app/module/vote/vote.route.ts
import express3 from "express";

// src/app/module/vote/vote.controller.ts
import httpStatus9 from "http-status";

// src/app/module/vote/vote.service.ts
import httpStatus8 from "http-status";
var toggleVote = async (payload, userId) => {
  const { ideaId, value } = payload;
  const idea = await prisma.idea.findUnique({ where: { id: ideaId } });
  if (!idea) {
    throw new AppError_default(httpStatus8.NOT_FOUND, "Idea not found");
  }
  const existingVote = await prisma.vote.findUnique({
    where: { userId_ideaId: { userId, ideaId } }
  });
  return await prisma.$transaction(async (tx) => {
    if (existingVote) {
      if (existingVote.value === value) {
        await tx.vote.delete({
          where: { userId_ideaId: { userId, ideaId } }
        });
        await tx.idea.update({
          where: { id: ideaId },
          data: {
            [value === 1 ? "upvoteCount" : "downvoteCount"]: { decrement: 1 }
          }
        });
        return { action: "removed", value: 0 };
      } else {
        const updatedVote = await tx.vote.update({
          where: { userId_ideaId: { userId, ideaId } },
          data: { value }
        });
        await tx.idea.update({
          where: { id: ideaId },
          data: {
            upvoteCount: { [value === 1 ? "increment" : "decrement"]: 1 },
            downvoteCount: { [value === -1 ? "increment" : "decrement"]: 1 }
          }
        });
        return { action: "updated", value: updatedVote.value };
      }
    }
    const newVote = await tx.vote.create({
      data: { userId, ideaId, value }
    });
    await tx.idea.update({
      where: { id: ideaId },
      data: {
        [value === 1 ? "upvoteCount" : "downvoteCount"]: { increment: 1 }
      }
    });
    return { action: "added", value: newVote.value };
  });
};
var getIdeaVotesSummary = async (ideaId) => {
  const idea = await prisma.idea.findUnique({
    where: { id: ideaId },
    select: { upvoteCount: true, downvoteCount: true }
  });
  if (!idea) {
    throw new AppError_default(httpStatus8.NOT_FOUND, "Idea not found");
  }
  return {
    upvotes: idea.upvoteCount,
    downvotes: idea.downvoteCount,
    score: idea.upvoteCount - idea.downvoteCount
  };
};
var VoteService = {
  toggleVote,
  getIdeaVotesSummary
};

// src/app/module/vote/vote.controller.ts
var toggleVote2 = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const result = await VoteService.toggleVote(req.body, userId);
  sendResponse(res, {
    httpStatusCode: httpStatus9.OK,
    success: true,
    message: `Vote ${result.action} successfully`,
    data: result
  });
});
var getIdeaVotesSummary2 = catchAsync(async (req, res) => {
  const ideaId = req.params.ideaId;
  const summary = await VoteService.getIdeaVotesSummary(ideaId);
  sendResponse(res, {
    httpStatusCode: httpStatus9.OK,
    success: true,
    message: "Votes summary retrieved successfully",
    data: summary
  });
});
var VoteController = {
  toggleVote: toggleVote2,
  getIdeaVotesSummary: getIdeaVotesSummary2
};

// src/app/module/vote/vote.validator.ts
import { z as z7 } from "zod";
var voteZodSchema = z7.object({
  ideaId: z7.string().min(1, "Idea ID is required"),
  value: z7.number().refine((v) => v === 1 || v === -1, {
    message: "Vote value must be 1 (upvote) or -1 (downvote)"
  })
});

// src/app/module/vote/vote.route.ts
var router7 = express3.Router();
router7.get("/summary/:ideaId", VoteController.getIdeaVotesSummary);
router7.post(
  "/",
  checkAuth(Role.MEMBER, Role.MODERATOR, Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(voteZodSchema),
  VoteController.toggleVote
);
var VoteRoutes = router7;

// src/app/module/follow/follow.route.ts
import express4 from "express";

// src/app/module/follow/follow.controller.ts
import httpStatus11 from "http-status";

// src/app/module/follow/follow.service.ts
import httpStatus10 from "http-status";
var toggleFollow = async (followerId, followingId) => {
  if (followerId === followingId) {
    throw new AppError_default(httpStatus10.BAD_REQUEST, "You cannot follow yourself");
  }
  const followingUser = await prisma.user.findUnique({ where: { id: followingId } });
  if (!followingUser) {
    throw new AppError_default(httpStatus10.NOT_FOUND, "User to follow not found");
  }
  const existingFollow = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId, followingId } }
  });
  if (existingFollow) {
    await prisma.follow.delete({
      where: { followerId_followingId: { followerId, followingId } }
    });
    return { action: "unfollowed" };
  }
  await prisma.follow.create({
    data: { followerId, followingId }
  });
  return { action: "followed" };
};
var getUserFollowers = async (userId) => {
  const followers = await prisma.follow.findMany({
    where: { followingId: userId },
    include: {
      follower: { select: { id: true, name: true, image: true, role: true } }
    }
  });
  return followers;
};
var getUserFollowing = async (userId) => {
  const following = await prisma.follow.findMany({
    where: { followerId: userId },
    include: {
      following: { select: { id: true, name: true, image: true, role: true } }
    }
  });
  return following;
};
var FollowService = {
  toggleFollow,
  getUserFollowers,
  getUserFollowing
};

// src/app/module/follow/follow.controller.ts
var toggleFollow2 = catchAsync(async (req, res) => {
  const followerId = req.user.userId;
  const { followingId } = req.body;
  const result = await FollowService.toggleFollow(followerId, followingId);
  sendResponse(res, {
    httpStatusCode: httpStatus11.OK,
    success: true,
    message: `User ${result.action} successfully`,
    data: result
  });
});
var getUserFollowers2 = catchAsync(async (req, res) => {
  const userId = req.params.userId;
  const followers = await FollowService.getUserFollowers(userId);
  sendResponse(res, {
    httpStatusCode: httpStatus11.OK,
    success: true,
    message: "Followers retrieved successfully",
    data: followers
  });
});
var getUserFollowing2 = catchAsync(async (req, res) => {
  const userId = req.params.userId;
  const following = await FollowService.getUserFollowing(userId);
  sendResponse(res, {
    httpStatusCode: httpStatus11.OK,
    success: true,
    message: "Following users retrieved successfully",
    data: following
  });
});
var FollowController = {
  toggleFollow: toggleFollow2,
  getUserFollowers: getUserFollowers2,
  getUserFollowing: getUserFollowing2
};

// src/app/module/follow/follow.validator.ts
import { z as z8 } from "zod";
var followZodSchema = z8.object({
  followingId: z8.string().min(1, "Following ID is required")
});

// src/app/module/follow/follow.route.ts
var router8 = express4.Router();
router8.get("/followers/:userId", FollowController.getUserFollowers);
router8.get("/following/:userId", FollowController.getUserFollowing);
router8.post(
  "/",
  checkAuth(Role.MEMBER, Role.MODERATOR, Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(followZodSchema),
  FollowController.toggleFollow
);
var FollowRoutes = router8;

// src/app/module/watchlist/watchlist.route.ts
import express5 from "express";

// src/app/module/watchlist/watchlist.controller.ts
import httpStatus13 from "http-status";

// src/app/module/watchlist/watchlist.service.ts
import httpStatus12 from "http-status";
var toggleWatchlist = async (userId, ideaId) => {
  const idea = await prisma.idea.findUnique({ where: { id: ideaId } });
  if (!idea) {
    throw new AppError_default(httpStatus12.NOT_FOUND, "Idea not found");
  }
  const existing = await prisma.watchlist.findUnique({
    where: { userId_ideaId: { userId, ideaId } }
  });
  if (existing) {
    if (existing.isDeleted) {
      await prisma.watchlist.update({
        where: { userId_ideaId: { userId, ideaId } },
        data: { isDeleted: false, deletedAt: null }
      });
      return { action: "added" };
    } else {
      await prisma.watchlist.update({
        where: { userId_ideaId: { userId, ideaId } },
        data: { isDeleted: true, deletedAt: /* @__PURE__ */ new Date() }
      });
      return { action: "removed" };
    }
  }
  await prisma.watchlist.create({
    data: { userId, ideaId }
  });
  return { action: "added" };
};
var getMyWatchlist = async (userId) => {
  const list = await prisma.watchlist.findMany({
    where: { userId, isDeleted: false },
    include: {
      idea: {
        include: {
          categories: { include: { category: true } },
          author: true,
          tags: { include: { tag: true } },
          _count: { select: { votes: true, comments: true } }
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });
  return list;
};
var WatchlistService = {
  toggleWatchlist,
  getMyWatchlist
};

// src/app/module/watchlist/watchlist.controller.ts
var toggleWatchlist2 = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const { ideaId } = req.body;
  const result = await WatchlistService.toggleWatchlist(userId, ideaId);
  sendResponse(res, {
    httpStatusCode: httpStatus13.OK,
    success: true,
    message: `Idea ${result.action} successfully to watchlist`,
    data: result
  });
});
var getMyWatchlist2 = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const watchlist = await WatchlistService.getMyWatchlist(userId);
  sendResponse(res, {
    httpStatusCode: httpStatus13.OK,
    success: true,
    message: "Watchlist retrieved successfully",
    data: watchlist
  });
});
var WatchlistController = {
  toggleWatchlist: toggleWatchlist2,
  getMyWatchlist: getMyWatchlist2
};

// src/app/module/watchlist/watchlist.validator.ts
import { z as z9 } from "zod";
var watchlistZodSchema = z9.object({
  ideaId: z9.string().min(1, "Idea ID is required")
});

// src/app/module/watchlist/watchlist.route.ts
var router9 = express5.Router();
router9.post(
  "/",
  checkAuth(Role.MEMBER, Role.MODERATOR, Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(watchlistZodSchema),
  WatchlistController.toggleWatchlist
);
router9.get(
  "/me",
  checkAuth(Role.MEMBER, Role.MODERATOR, Role.ADMIN, Role.SUPER_ADMIN),
  WatchlistController.getMyWatchlist
);
var WatchlistRoutes = router9;

// src/app/module/attachment/attachment.route.ts
import express6 from "express";

// src/app/module/attachment/attachment.controller.ts
import httpStatus15 from "http-status";

// src/app/module/attachment/attachment.service.ts
import httpStatus14 from "http-status";
var createAttachment = async (payload, userId, role) => {
  const { ideaId, type, url, title } = payload;
  const idea = await prisma.idea.findUnique({ where: { id: ideaId } });
  if (!idea) {
    throw new AppError_default(httpStatus14.NOT_FOUND, "Idea not found");
  }
  if (idea.authorId !== userId && role !== "ADMIN" && role !== "SUPER_ADMIN" && role !== "MODERATOR") {
    throw new AppError_default(httpStatus14.FORBIDDEN, "You don't have permission to add attachments to this idea");
  }
  const attachment = await prisma.attachment.create({
    data: { ideaId, type, url, title: title ?? null }
  });
  return attachment;
};
var getAttachmentsByIdea = async (ideaId) => {
  const list = await prisma.attachment.findMany({
    where: { ideaId },
    orderBy: { createdAt: "desc" }
  });
  return list;
};
var deleteAttachment = async (id, userId, role) => {
  const attachment = await prisma.attachment.findUnique({
    where: { id },
    include: { idea: true }
  });
  if (!attachment) {
    throw new AppError_default(httpStatus14.NOT_FOUND, "Attachment not found");
  }
  if (attachment.idea.authorId !== userId && role !== "ADMIN" && role !== "SUPER_ADMIN" && role !== "MODERATOR") {
    throw new AppError_default(httpStatus14.FORBIDDEN, "You don't have permission to delete this attachment");
  }
  if (attachment && attachment.url) {
    await deleteFileFromCloudinary(attachment.url);
  }
  await prisma.attachment.delete({
    where: { id }
  });
  return { message: "Attachment deleted successfully" };
};
var getAttachmentById = async (id) => {
  const attachment = await prisma.attachment.findUnique({
    where: { id }
  });
  if (!attachment) {
    throw new AppError_default(httpStatus14.NOT_FOUND, "Attachment not found");
  }
  return attachment;
};
var AttachmentService = {
  createAttachment,
  getAttachmentsByIdea,
  deleteAttachment,
  getAttachmentById
};

// src/app/module/attachment/attachment.controller.ts
var createAttachment2 = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const role = req.user.role;
  const payload = {
    ...req.body,
    url: req.file?.path
  };
  const attachment = await AttachmentService.createAttachment(payload, userId, role);
  sendResponse(res, {
    httpStatusCode: httpStatus15.CREATED,
    success: true,
    message: "Attachment added successfully",
    data: attachment
  });
});
var getAttachmentsByIdea2 = catchAsync(async (req, res) => {
  const { ideaId } = req.params;
  const attachments = await AttachmentService.getAttachmentsByIdea(ideaId);
  sendResponse(res, {
    httpStatusCode: httpStatus15.OK,
    success: true,
    message: "Attachments retrieved successfully",
    data: attachments
  });
});
var deleteAttachment2 = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const role = req.user.role;
  const { id } = req.params;
  const result = await AttachmentService.deleteAttachment(id, userId, role);
  sendResponse(res, {
    httpStatusCode: httpStatus15.OK,
    success: true,
    message: "Attachment deleted successfully",
    data: result
  });
});
var downloadAttachment = catchAsync(async (req, res) => {
  const { id } = req.params;
  const attachment = await AttachmentService.getAttachmentById(id);
  if (!attachment) {
    return sendResponse(res, {
      httpStatusCode: httpStatus15.NOT_FOUND,
      success: false,
      message: "Attachment not found"
    });
  }
  if (attachment.url.includes("cloudinary")) {
    const downloadUrl = attachment.url.replace("/upload/", "/upload/fl_attachment/");
    res.redirect(downloadUrl);
  } else {
    res.redirect(attachment.url);
  }
});
var AttachmentController = {
  createAttachment: createAttachment2,
  getAttachmentsByIdea: getAttachmentsByIdea2,
  deleteAttachment: deleteAttachment2,
  downloadAttachment
};

// src/app/module/attachment/attachment.validator.ts
import { z as z10 } from "zod";
var createAttachmentZodSchema = z10.object({
  type: z10.enum(["VIDEO", "PDF", "DOCUMENT"]),
  url: z10.string().optional(),
  title: z10.string().optional(),
  ideaId: z10.string().min(1, "Idea ID is required")
});
var updateAttachmentZodSchema = z10.object({
  title: z10.string().optional(),
  url: z10.string().url("Valid URL is required").optional()
});

// src/app/module/attachment/attachment.route.ts
var router10 = express6.Router();
router10.get("/idea/:ideaId", AttachmentController.getAttachmentsByIdea);
router10.get("/:id/download", AttachmentController.downloadAttachment);
router10.post(
  "/",
  multerUpload.single("file"),
  checkAuth(Role.MEMBER, Role.MODERATOR, Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(createAttachmentZodSchema),
  AttachmentController.createAttachment
);
router10.delete(
  "/:id",
  checkAuth(Role.MEMBER, Role.MODERATOR, Role.ADMIN, Role.SUPER_ADMIN),
  AttachmentController.deleteAttachment
);
var AttachmentRoutes = router10;

// src/app/module/ideaReview/ideaReview.route.ts
import express7 from "express";

// src/app/module/ideaReview/ideaReview.controller.ts
import httpStatus17 from "http-status";

// src/app/module/ideaReview/ideaReview.service.ts
import httpStatus16 from "http-status";
var createIdeaReview = async (payload, reviewerId) => {
  const { ideaId, status: status17, feedback } = payload;
  const idea = await prisma.idea.findUnique({ where: { id: ideaId } });
  if (!idea) {
    throw new AppError_default(httpStatus16.NOT_FOUND, "Idea not found");
  }
  const result = await prisma.$transaction(async (tx) => {
    const updatedIdea = await tx.idea.update({
      where: { id: ideaId },
      data: {
        status: status17,
        adminFeedback: feedback,
        reviewedBy: reviewerId,
        reviewedAt: /* @__PURE__ */ new Date(),
        publishedAt: status17 === "APPROVED" ? /* @__PURE__ */ new Date() : null
      }
    });
    const review = await tx.ideaReview.create({
      data: {
        ideaId,
        reviewerId,
        status: status17,
        feedback
      }
    });
    return { updatedIdea, review };
  });
  return result;
};
var getReviewHistoryByIdea = async (ideaId) => {
  const list = await prisma.ideaReview.findMany({
    where: { ideaId, isDeleted: false },
    include: {
      reviewer: { select: { id: true, name: true, role: true } }
    },
    orderBy: { createdAt: "desc" }
  });
  return list;
};
var IdeaReviewService = {
  createIdeaReview,
  getReviewHistoryByIdea
};

// src/app/module/ideaReview/ideaReview.controller.ts
var createIdeaReview2 = catchAsync(async (req, res) => {
  const reviewerId = req.user.userId;
  const result = await IdeaReviewService.createIdeaReview(req.body, reviewerId);
  sendResponse(res, {
    httpStatusCode: httpStatus17.CREATED,
    success: true,
    message: "Idea reviewed successfully",
    data: result
  });
});
var getReviewHistoryByIdea2 = catchAsync(async (req, res) => {
  const { ideaId } = req.params;
  const reviews = await IdeaReviewService.getReviewHistoryByIdea(ideaId);
  sendResponse(res, {
    httpStatusCode: httpStatus17.OK,
    success: true,
    message: "Review history retrieved successfully",
    data: reviews
  });
});
var IdeaReviewController = {
  createIdeaReview: createIdeaReview2,
  getReviewHistoryByIdea: getReviewHistoryByIdea2
};

// src/app/module/ideaReview/ideaReview.validator.ts
import { z as z11 } from "zod";
var createIdeaReviewZodSchema = z11.object({
  body: z11.object({
    ideaId: z11.string().min(1, "Idea ID is required"),
    status: z11.enum(["UNDER_REVIEW", "APPROVED", "REJECTED"]),
    feedback: z11.string().min(5, "Feedback must be at least 5 characters")
  })
});

// src/app/module/ideaReview/ideaReview.route.ts
var router11 = express7.Router();
router11.get("/idea/:ideaId", IdeaReviewController.getReviewHistoryByIdea);
router11.post(
  "/",
  checkAuth(Role.MODERATOR, Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(createIdeaReviewZodSchema),
  IdeaReviewController.createIdeaReview
);
var IdeaReviewRoutes = router11;

// src/app/module/moderator/moderator.route.ts
import express8 from "express";

// src/app/module/moderator/moderator.controller.ts
import httpStatus19 from "http-status";

// src/app/module/moderator/moderator.service.ts
import httpStatus18 from "http-status";

// src/app/module/moderator/moderator.constant.ts
var moderatorSearchableFields = ["name", "email"];
var moderatorFilterableFields = ["isActive", "user.status", "isDeleted"];
var moderatorIncludeConfig = {
  user: {
    select: {
      id: true,
      email: true,
      status: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          ideas: true,
          purchasedIdeas: true,
          followers: true,
          following: true,
          reviewsPerformed: true
        }
      }
    }
  }
};

// src/app/module/moderator/moderator.service.ts
var getMyProfile = async (userId) => {
  const profile = await prisma.moderator.findUnique({
    where: { userId },
    include: { user: { select: { id: true, name: true, email: true, image: true, role: true, status: true } } }
  });
  if (!profile) {
    throw new AppError_default(httpStatus18.NOT_FOUND, "Moderator profile not found");
  }
  return profile;
};
var updateMyProfile = async (userId, payload) => {
  const moderator = await prisma.moderator.findUnique({
    where: { userId }
  });
  if (!moderator) {
    throw new AppError_default(httpStatus18.NOT_FOUND, "Moderator profile not found");
  }
  const result = await prisma.$transaction(async (tx) => {
    const updatedMod = await tx.moderator.update({
      where: { userId },
      data: payload
    });
    if (payload.name) {
      await tx.user.update({
        where: { id: userId },
        data: {
          name: payload.name,
          ...payload.image !== void 0 && { image: payload.image }
        }
      });
    }
    return updatedMod;
  });
  return result;
};
var getAllModerators = async (queryParams) => {
  const queryBuilder = new QueryBuilder(
    prisma.moderator,
    queryParams,
    {
      searchableFields: moderatorSearchableFields,
      filterableFields: moderatorFilterableFields
    }
  );
  return await queryBuilder.search().filter().paginate().sort().include(moderatorIncludeConfig).execute();
};
var toggleModeratorStatus = async (id) => {
  const mod = await prisma.moderator.findUnique({ where: { id } });
  if (!mod) {
    throw new AppError_default(httpStatus18.NOT_FOUND, "Moderator not found");
  }
  return await prisma.moderator.update({
    where: { id },
    data: { isActive: !mod.isActive }
  });
};
var ModeratorService = {
  getMyProfile,
  updateMyProfile,
  getAllModerators,
  toggleModeratorStatus
};

// src/app/module/moderator/moderator.controller.ts
var getMyProfile2 = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const profile = await ModeratorService.getMyProfile(userId);
  if (!profile) {
    throw new AppError_default(httpStatus19.NOT_FOUND, "Moderator profile not found");
  }
  sendResponse(res, {
    httpStatusCode: httpStatus19.OK,
    success: true,
    message: "Moderator profile retrieved successfully",
    data: profile
  });
});
var updateMyProfile2 = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const payload = {
    ...req.body
  };
  if (req.file) {
    payload.image = req.file.path;
  }
  console.log("payload", payload);
  const updatedProfile = await ModeratorService.updateMyProfile(userId, payload);
  sendResponse(res, {
    httpStatusCode: httpStatus19.OK,
    success: true,
    message: "Moderator profile updated successfully",
    data: updatedProfile
  });
});
var getAllModerators2 = catchAsync(async (req, res) => {
  const result = await ModeratorService.getAllModerators(req.query);
  sendResponse(res, {
    httpStatusCode: httpStatus19.OK,
    success: true,
    message: "Moderators retrieved successfully",
    data: result.data,
    meta: result.meta
  });
});
var toggleModeratorStatus2 = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await ModeratorService.toggleModeratorStatus(id);
  sendResponse(res, {
    httpStatusCode: httpStatus19.OK,
    success: true,
    message: "Moderator status toggled successfully",
    data: result
  });
});
var ModeratorController = {
  getMyProfile: getMyProfile2,
  updateMyProfile: updateMyProfile2,
  getAllModerators: getAllModerators2,
  toggleModeratorStatus: toggleModeratorStatus2
};

// src/app/module/moderator/moderator.validator.ts
import { z as z12 } from "zod";
var handleJsonString = (val) => {
  if (typeof val === "string") {
    try {
      return JSON.parse(val);
    } catch {
      return val;
    }
  }
  return val;
};
var updateModeratorZodSchema = z12.object({
  name: z12.string().optional(),
  image: z12.string().optional(),
  profilePhoto: z12.string().url().optional(),
  contactNumber: z12.string().optional(),
  bio: z12.string().optional(),
  address: z12.string().optional(),
  phoneNumber: z12.string().optional(),
  socialLinks: z12.preprocess(handleJsonString, z12.record(z12.string(), z12.string()).optional())
});

// src/app/module/moderator/moderator.route.ts
var router12 = express8.Router();
router12.get(
  "/profile",
  checkAuth(Role.MODERATOR),
  ModeratorController.getMyProfile
);
router12.patch(
  "/profile",
  multerUpload.single("file"),
  checkAuth(Role.MODERATOR),
  validateRequest(updateModeratorZodSchema),
  ModeratorController.updateMyProfile
);
router12.get(
  "/",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  ModeratorController.getAllModerators
);
router12.patch(
  "/toggle-status/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  ModeratorController.toggleModeratorStatus
);
var ModeratorRoutes = router12;

// src/app/module/payment/payment.route.ts
import { Router as Router11 } from "express";

// src/app/module/payment/payment.controller.ts
import status10 from "http-status";
var handleStripeWebhookEvent = catchAsync(async (req, res) => {
  const signature = req.headers["stripe-signature"];
  const webhookSecret = envVars.STRIPE.STRIPE_WEBHOOK_SECRET;
  if (!signature || !webhookSecret) {
    console.error("Missing Stripe signature or webhook secret");
    return res.status(status10.BAD_REQUEST).json({ message: "Missing Stripe signature or webhook secret" });
  }
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
  } catch (error) {
    console.error("Error processing Stripe webhook:", error);
    return res.status(status10.BAD_REQUEST).json({ message: "Error processing Stripe webhook" });
  }
  try {
    const result = await PaymentService.handlerStripeWebhookEvent(event);
    sendResponse(res, {
      httpStatusCode: status10.OK,
      success: true,
      message: "Stripe webhook event processed successfully",
      data: result
    });
  } catch (error) {
    console.error("Error handling Stripe webhook event:", error);
    sendResponse(res, {
      httpStatusCode: status10.INTERNAL_SERVER_ERROR,
      success: false,
      message: "Error handling Stripe webhook event"
    });
  }
});
var handleBkashWebhookEvent = catchAsync(async (req, res) => {
  sendResponse(res, { httpStatusCode: status10.OK, success: true, message: "bKash webhook received" });
});
var handleSslWebhookEvent = catchAsync(async (req, res) => {
  sendResponse(res, { httpStatusCode: status10.OK, success: true, message: "SSLCommerce webhook received" });
});
var handleNagadWebhookEvent = catchAsync(async (req, res) => {
  sendResponse(res, { httpStatusCode: status10.OK, success: true, message: "Nagad webhook received" });
});
var handleCardWebhookEvent = catchAsync(async (req, res) => {
  sendResponse(res, { httpStatusCode: status10.OK, success: true, message: "Card webhook received" });
});
var createCheckoutSession = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const { ideaId, paymentMethod } = req.body;
  const method = paymentMethod || "STRIPE";
  let result;
  result = await PaymentService.createStripeSession(userId, ideaId);
  sendResponse(res, {
    httpStatusCode: status10.OK,
    success: true,
    message: "Checkout session created successfully",
    data: result
  });
});
var getMyPurchases4 = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const result = await PaymentService.getMyPurchases(userId);
  sendResponse(res, {
    httpStatusCode: status10.OK,
    success: true,
    message: "My purchases retrieved successfully",
    data: result
  });
});
var getAllPurchases2 = catchAsync(async (req, res) => {
  const result = await PaymentService.getAllPurchases();
  sendResponse(res, {
    httpStatusCode: status10.OK,
    success: true,
    message: "All purchases retrieved successfully",
    data: result
  });
});
var PaymentController = {
  handleStripeWebhookEvent,
  handleBkashWebhookEvent,
  handleSslWebhookEvent,
  handleNagadWebhookEvent,
  handleCardWebhookEvent,
  createCheckoutSession,
  getMyPurchases: getMyPurchases4,
  getAllPurchases: getAllPurchases2
};

// src/app/module/payment/payment.validatior.ts
import { z as z13 } from "zod";
var createCheckoutSessionSchema = z13.object({
  ideaId: z13.string({
    message: "Idea ID is required"
  }).min(1, "Idea ID is required"),
  paymentMethod: z13.enum(["STRIPE", "SSLECOMMERCE", "BKASH", "NAGAD", "CARD"]).optional().default("STRIPE")
});
var PaymentValidator = {
  createCheckoutSessionSchema
};

// src/app/module/payment/payment.route.ts
var router13 = Router11();
router13.post(
  "/create-checkout-session",
  checkAuth(Role.MEMBER, Role.MODERATOR, Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(PaymentValidator.createCheckoutSessionSchema),
  PaymentController.createCheckoutSession
);
router13.get(
  "/my-purchases",
  checkAuth(Role.MEMBER, Role.MODERATOR, Role.ADMIN, Role.SUPER_ADMIN),
  PaymentController.getMyPurchases
);
router13.get(
  "/all-purchases",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  PaymentController.getAllPurchases
);
var PaymentRoutes = router13;

// src/app/module/subscription/subscription.route.ts
import { Router as Router12 } from "express";

// src/app/module/subscription/subscription.controller.ts
import status12 from "http-status";

// src/app/module/subscription/subscription.service.ts
import status11 from "http-status";

// src/app/module/subscription/subscription.constant.ts
var subscriptionSearchableFields = [];
var subscriptionFilterableFields = ["userId", "tier", "isActive", "subscriptionPlanId", "paymentId"];
var subscriptionPlanSearchableFields = ["name", "description"];
var subscriptionPlanFilterableFields = ["isActive", "isPopular", "tier"];
var subscriptionIncludeConfig = {
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      image: true
    }
  },
  subscriptionPlan: true,
  payment: true
};

// src/app/module/subscription/subscription.service.ts
var createSubscriptionPlan = async (payload) => {
  return await prisma.subscriptionPlan.create({
    data: payload
  });
};
var getAllSubscriptionPlans = async (queryParams) => {
  const modifiedQueryParams = {
    sortBy: "order",
    sortOrder: "asc",
    ...queryParams
  };
  const subscriptionPlanQuery = new QueryBuilder(prisma.subscriptionPlan, modifiedQueryParams, {
    searchableFields: subscriptionPlanSearchableFields,
    filterableFields: subscriptionPlanFilterableFields
  }).search().filter().paginate().sort();
  return await subscriptionPlanQuery.execute();
};
var getSubscriptionPlanById = async (id) => {
  return await prisma.subscriptionPlan.findUniqueOrThrow({
    where: { id }
  });
};
var updateSubscriptionPlan = async (id, payload) => {
  return await prisma.subscriptionPlan.update({
    where: { id },
    data: payload
  });
};
var deleteSubscriptionPlan = async (id) => {
  return await prisma.subscriptionPlan.delete({
    where: { id }
  });
};
var prepareSubscription = async (userId, subscriptionPlanId) => {
  const plan = await prisma.subscriptionPlan.findUnique({
    where: { id: subscriptionPlanId }
  });
  if (!plan) {
    throw new AppError_default(status11.NOT_FOUND, "Subscription plan not found");
  }
  if (!plan.isActive) {
    throw new AppError_default(status11.BAD_REQUEST, "This subscription plan is not currently active");
  }
  if (plan.price === 0) {
    const result = await prisma.subscription.upsert({
      where: { userId },
      update: {
        tier: plan.tier,
        subscriptionPlanId: plan.id,
        startDate: /* @__PURE__ */ new Date(),
        endDate: new Date(Date.now() + plan.durationDays * 24 * 60 * 60 * 1e3),
        isActive: true
      },
      create: {
        userId,
        tier: plan.tier,
        subscriptionPlanId: plan.id,
        startDate: /* @__PURE__ */ new Date(),
        endDate: new Date(Date.now() + plan.durationDays * 24 * 60 * 60 * 1e3),
        isActive: true
      }
    });
    return { isFree: true, message: "Successfully subscribed to free plan", subscription: result };
  }
  const payment = await prisma.payment.create({
    data: {
      amount: plan.price,
      status: PaymentStatus.PENDING,
      userId
    }
  });
  return { isFree: false, plan, payment };
};
var subscribeViaStripe = async (userId, subscriptionPlanId) => {
  const prepared = await prepareSubscription(userId, subscriptionPlanId);
  const { plan, payment } = prepared;
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `Subscription: ${plan.name}`,
            description: plan.description || `Upgrade to ${plan.name}`
          },
          unit_amount: Math.round(plan.price * 100)
        },
        quantity: 1
      }
    ],
    mode: "payment",
    success_url: `${envVars.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${envVars.FRONTEND_URL}/payment/cancel`,
    metadata: {
      paymentId: payment.id,
      subscriptionPlanId: plan.id,
      userId,
      isSubscriptionCheck: "true"
    }
  });
  return { url: session.url };
};
var subscribeViaBkash = async (userId, subscriptionPlanId) => {
  const prepared = await prepareSubscription(userId, subscriptionPlanId);
  if (prepared.isFree) return { message: prepared.message, subscription: prepared.subscription };
  return { url: `${envVars.FRONTEND_URL}/bkash-processing?payment_id=${prepared.payment.id}` };
};
var subscribeViaSsl = async (userId, subscriptionPlanId) => {
  const prepared = await prepareSubscription(userId, subscriptionPlanId);
  if (prepared.isFree) return { message: prepared.message, subscription: prepared.subscription };
  return { url: `${envVars.FRONTEND_URL}/sslcommerce-processing?payment_id=${prepared.payment.id}` };
};
var subscribeViaNagad = async (userId, subscriptionPlanId) => {
  const prepared = await prepareSubscription(userId, subscriptionPlanId);
  if (prepared.isFree) return { message: prepared.message, subscription: prepared.subscription };
  return { url: `${envVars.FRONTEND_URL}/nagad-processing?payment_id=${prepared.payment.id}` };
};
var subscribeViaCard = async (userId, subscriptionPlanId) => {
  const prepared = await prepareSubscription(userId, subscriptionPlanId);
  if (prepared.isFree) return { message: prepared.message, subscription: prepared.subscription };
  return { url: `${envVars.FRONTEND_URL}/card-processing?payment_id=${prepared.payment.id}` };
};
var getMySubscription = async (userId) => {
  return prisma.subscription.findMany({
    where: { userId },
    include: {
      subscriptionPlan: true,
      payment: true
    },
    orderBy: {
      createdAt: "desc"
    }
  });
};
var getAllSubscriptionsFromDb = async (queryParams) => {
  const subscriptionQuery = new QueryBuilder(prisma.subscription, queryParams, {
    searchableFields: subscriptionSearchableFields,
    filterableFields: subscriptionFilterableFields
  }).search().filter().paginate().sort().dynamicInclude(subscriptionIncludeConfig, Object.keys(subscriptionIncludeConfig));
  return await subscriptionQuery.execute();
};
var SubscriptionService = {
  createSubscriptionPlan,
  getAllSubscriptionPlans,
  getSubscriptionPlanById,
  updateSubscriptionPlan,
  deleteSubscriptionPlan,
  subscribeViaStripe,
  subscribeViaBkash,
  subscribeViaSsl,
  subscribeViaNagad,
  subscribeViaCard,
  getMySubscription,
  getAllSubscriptionsFromDb
};

// src/app/module/subscription/subscription.controller.ts
var createSubscriptionPlan2 = catchAsync(async (req, res) => {
  const result = await SubscriptionService.createSubscriptionPlan(req.body);
  sendResponse(res, {
    httpStatusCode: status12.CREATED,
    success: true,
    message: "Subscription plan created successfully",
    data: result
  });
});
var getAllSubscriptionPlans2 = catchAsync(async (req, res) => {
  const result = await SubscriptionService.getAllSubscriptionPlans(req.query);
  sendResponse(res, {
    httpStatusCode: status12.OK,
    success: true,
    message: "Subscription plans retrieved successfully",
    data: result.data,
    meta: result.meta
  });
});
var getSubscriptionPlanById2 = catchAsync(async (req, res) => {
  const result = await SubscriptionService.getSubscriptionPlanById(req.params.id);
  sendResponse(res, {
    httpStatusCode: status12.OK,
    success: true,
    message: "Subscription plan retrieved successfully",
    data: result
  });
});
var updateSubscriptionPlan2 = catchAsync(async (req, res) => {
  const result = await SubscriptionService.updateSubscriptionPlan(req.params.id, req.body);
  sendResponse(res, {
    httpStatusCode: status12.OK,
    success: true,
    message: "Subscription plan updated successfully",
    data: result
  });
});
var deleteSubscriptionPlan2 = catchAsync(async (req, res) => {
  const result = await SubscriptionService.deleteSubscriptionPlan(req.params.id);
  sendResponse(res, {
    httpStatusCode: status12.OK,
    success: true,
    message: "Subscription plan deleted successfully",
    data: result
  });
});
var subscribeToPlan = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const { subscriptionPlanId, paymentMethod } = req.body;
  const method = paymentMethod || "STRIPE";
  console.log("SubscriptionPlanId:", subscriptionPlanId);
  console.log("PaymentMethod:", method);
  let result = await SubscriptionService.subscribeViaStripe(userId, subscriptionPlanId);
  sendResponse(res, {
    httpStatusCode: status12.OK,
    success: true,
    message: "Subscription initialized successfully",
    data: result
  });
});
var getMySubscription2 = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const result = await SubscriptionService.getMySubscription(userId);
  sendResponse(res, {
    httpStatusCode: status12.OK,
    success: true,
    message: "My subscription retrieved successfully",
    data: result
  });
});
var getAllSubscriptions = catchAsync(async (req, res) => {
  const queryParams = req.query;
  const result = await SubscriptionService.getAllSubscriptionsFromDb(queryParams);
  sendResponse(res, {
    httpStatusCode: status12.OK,
    success: true,
    message: "All subscriptions retrieved successfully",
    data: result
  });
});
var SubscriptionController = {
  createSubscriptionPlan: createSubscriptionPlan2,
  getAllSubscriptionPlans: getAllSubscriptionPlans2,
  getSubscriptionPlanById: getSubscriptionPlanById2,
  updateSubscriptionPlan: updateSubscriptionPlan2,
  deleteSubscriptionPlan: deleteSubscriptionPlan2,
  subscribeToPlan,
  getMySubscription: getMySubscription2,
  getAllSubscriptions
};

// src/app/module/subscription/subscription.validator.ts
import { z as z14 } from "zod";
var createSubscriptionPlanSchema = z14.object({
  name: z14.string({ message: "Name is required" }).min(1, "Name is required"),
  description: z14.string().optional(),
  tier: z14.nativeEnum(SubscriptionTier, { message: "Tier is required" }),
  price: z14.number({ message: "Price is required" }).min(0),
  durationDays: z14.number().int().positive().optional(),
  features: z14.array(z14.string()).optional(),
  order: z14.number().int().optional(),
  isPopular: z14.boolean().optional(),
  buttonText: z14.string().optional()
});
var updateSubscriptionPlanSchema = z14.object({
  name: z14.string().optional(),
  description: z14.string().optional(),
  tier: z14.nativeEnum(SubscriptionTier).optional(),
  price: z14.number().min(0).optional(),
  durationDays: z14.number().int().positive().optional(),
  features: z14.array(z14.string()).optional(),
  order: z14.number().int().optional(),
  isPopular: z14.boolean().optional(),
  buttonText: z14.string().optional(),
  isActive: z14.boolean().optional()
});
var subscribeToPlanSchema = z14.object({
  subscriptionPlanId: z14.string({ message: "Subscription Plan ID is required" }).min(1, "Subscription Plan ID is required"),
  paymentMethod: z14.enum(["STRIPE", "SSLECOMMERCE", "BKASH", "NAGAD", "CARD"]).optional().default("STRIPE")
});
var SubscriptionValidator = {
  createSubscriptionPlanSchema,
  updateSubscriptionPlanSchema,
  subscribeToPlanSchema
};

// src/app/module/subscription/subscription.route.ts
var router14 = Router12();
router14.post(
  "/plans",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(SubscriptionValidator.createSubscriptionPlanSchema),
  SubscriptionController.createSubscriptionPlan
);
router14.get(
  "/plans",
  SubscriptionController.getAllSubscriptionPlans
);
router14.get(
  "/plans/:id",
  SubscriptionController.getSubscriptionPlanById
);
router14.patch(
  "/plans/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(SubscriptionValidator.updateSubscriptionPlanSchema),
  SubscriptionController.updateSubscriptionPlan
);
router14.delete(
  "/plans/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  SubscriptionController.deleteSubscriptionPlan
);
router14.post(
  "/subscribe",
  checkAuth(Role.MEMBER, Role.MODERATOR),
  validateRequest(SubscriptionValidator.subscribeToPlanSchema),
  SubscriptionController.subscribeToPlan
);
router14.get(
  "/my-subscription",
  checkAuth(Role.MEMBER, Role.MODERATOR),
  SubscriptionController.getMySubscription
);
router14.get(
  "/all-subscription",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  SubscriptionController.getAllSubscriptions
);
var SubscriptionRoutes = router14;

// src/app/module/member/member.route.ts
import express9 from "express";

// src/app/module/member/member.controller.ts
import httpStatus21 from "http-status";

// src/app/module/member/member.service.ts
import httpStatus20 from "http-status";

// src/app/module/member/member.constant.ts
var memberSearchableFields = ["name", "email"];
var memberFilterableFields = ["role", "user.status", "isDeleted"];
var memberIncludeConfig = {
  _count: {
    select: {
      ideas: true,
      purchasedIdeas: true,
      followers: true,
      following: true,
      reviewsPerformed: true
    }
  }
};

// src/app/module/member/member.service.ts
var getMyProfile3 = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId, isDeleted: false },
    include: memberIncludeConfig
  });
  if (!user) {
    throw new AppError_default(httpStatus20.NOT_FOUND, "User profile not found");
  }
  return user;
};
var updateMyProfile3 = async (userId, payload) => {
  const user = await prisma.user.findUnique({
    where: { id: userId, isDeleted: false }
  });
  if (!user) {
    throw new AppError_default(httpStatus20.NOT_FOUND, "User profile not found");
  }
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: payload,
    include: memberIncludeConfig
  });
  return updatedUser;
};
var getMyPurchasedIdeas = async (userId) => {
  return await prisma.ideaPurchase.findMany({
    where: { userId },
    include: {
      idea: {
        include: {
          categories: {
            include: {
              category: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  icon: true,
                  color: true
                }
              }
            }
          },
          tags: {
            include: {
              tag: {
                select: {
                  id: true,
                  name: true,
                  slug: true
                }
              }
            }
          },
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true
            }
          }
        }
      },
      // Payment info acts as invoice
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    },
    orderBy: { purchasedAt: "desc" }
  });
};
var getMyFollowers = async (userId) => {
  return await prisma.follow.findMany({
    where: { followingId: userId },
    include: {
      follower: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true
        }
      }
    }
  });
};
var getMyFollowing = async (userId) => {
  return await prisma.follow.findMany({
    where: { followerId: userId },
    include: {
      following: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true
        }
      }
    }
  });
};
var getMyReviews = async (userId) => {
  return await prisma.ideaReview.findMany({
    where: { reviewerId: userId },
    include: {
      idea: {
        select: {
          id: true,
          title: true,
          slug: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });
};
var getInvoice = async (paymentId, userId) => {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId, userId },
    include: {
      user: {
        select: {
          name: true,
          email: true
        }
      }
    }
  });
  if (!payment) {
    throw new AppError_default(httpStatus20.NOT_FOUND, "Invoice not found");
  }
  return payment;
};
var getAllMembers = async (queryParams) => {
  const queryBuilder = new QueryBuilder(
    prisma.user,
    queryParams,
    {
      searchableFields: memberSearchableFields,
      filterableFields: memberFilterableFields
    }
  );
  return await queryBuilder.search().filter().paginate().sort().include(memberIncludeConfig).where({
    role: Role.MEMBER
  }).execute();
};
var MemberService = {
  getMyProfile: getMyProfile3,
  updateMyProfile: updateMyProfile3,
  getMyPurchasedIdeas,
  getMyFollowers,
  getMyFollowing,
  getMyReviews,
  getInvoice,
  getAllMembers
};

// src/app/module/member/member.controller.ts
var getMyProfile4 = catchAsync(async (req, res) => {
  const userId = req.user?.userId;
  const result = await MemberService.getMyProfile(userId);
  sendResponse(res, {
    httpStatusCode: httpStatus21.OK,
    success: true,
    message: "Profile retrieved successfully",
    data: result
  });
});
var updateMyProfile4 = catchAsync(async (req, res) => {
  const userId = req.user?.userId;
  const file = req.file;
  const payload = {
    ...req.body,
    ...file && { image: file.path }
  };
  const result = await MemberService.updateMyProfile(userId, payload);
  sendResponse(res, {
    httpStatusCode: httpStatus21.OK,
    success: true,
    message: "Profile updated successfully",
    data: result
  });
});
var getMyPurchasedIdeas2 = catchAsync(async (req, res) => {
  const userId = req.user?.userId;
  const result = await MemberService.getMyPurchasedIdeas(userId);
  sendResponse(res, {
    httpStatusCode: httpStatus21.OK,
    success: true,
    message: "Purchased ideas retrieved successfully",
    data: result
  });
});
var getMyFollowers2 = catchAsync(async (req, res) => {
  const userId = req.user?.userId;
  const result = await MemberService.getMyFollowers(userId);
  sendResponse(res, {
    httpStatusCode: httpStatus21.OK,
    success: true,
    message: "Followers retrieved successfully",
    data: result
  });
});
var getMyFollowing2 = catchAsync(async (req, res) => {
  const userId = req.user?.userId;
  const result = await MemberService.getMyFollowing(userId);
  sendResponse(res, {
    httpStatusCode: httpStatus21.OK,
    success: true,
    message: "Following users retrieved successfully",
    data: result
  });
});
var getMyReviews2 = catchAsync(async (req, res) => {
  const userId = req.user?.userId;
  const result = await MemberService.getMyReviews(userId);
  sendResponse(res, {
    httpStatusCode: httpStatus21.OK,
    success: true,
    message: "Reviews retrieved successfully",
    data: result
  });
});
var getInvoice2 = catchAsync(async (req, res) => {
  const userId = req.user?.userId;
  const paymentId = String(req.params.paymentId);
  const result = await MemberService.getInvoice(paymentId, userId);
  sendResponse(res, {
    httpStatusCode: httpStatus21.OK,
    success: true,
    message: "Invoice retrieved successfully",
    data: result
  });
});
var getAllMembers2 = catchAsync(async (req, res) => {
  const result = await MemberService.getAllMembers(req.query);
  sendResponse(res, {
    httpStatusCode: httpStatus21.OK,
    success: true,
    message: "Members retrieved successfully",
    data: result.data,
    meta: result.meta
  });
});
var MemberController = {
  getMyProfile: getMyProfile4,
  updateMyProfile: updateMyProfile4,
  getMyPurchasedIdeas: getMyPurchasedIdeas2,
  getMyFollowers: getMyFollowers2,
  getMyFollowing: getMyFollowing2,
  getMyReviews: getMyReviews2,
  getInvoice: getInvoice2,
  getAllMembers: getAllMembers2
};

// src/app/module/member/member.interface.ts
import z15 from "zod";
var updateMemberZodSchema = z15.object({
  name: z15.string().optional(),
  image: z15.string().optional()
});

// src/app/module/member/member.route.ts
var router15 = express9.Router();
router15.use(checkAuth(Role.MEMBER, Role.MODERATOR, Role.ADMIN, Role.SUPER_ADMIN));
router15.get("/profile", MemberController.getMyProfile);
router15.patch("/profile", multerUpload.single("file"), validateRequest(updateMemberZodSchema), MemberController.updateMyProfile);
router15.get("/purchased-ideas", MemberController.getMyPurchasedIdeas);
router15.get("/followers", MemberController.getMyFollowers);
router15.get("/following", MemberController.getMyFollowing);
router15.get("/reviews", MemberController.getMyReviews);
router15.get("/invoice/:paymentId", MemberController.getInvoice);
router15.get("/", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), MemberController.getAllMembers);
var MemberRoutes = router15;

// src/app/module/stats/stats.route.ts
import { Router as Router14 } from "express";

// src/app/module/stats/stats.controller.ts
import httpStatus23 from "http-status";

// src/app/module/stats/stats.service.ts
import httpStatus22 from "http-status";
var getDashboardStatsData = async (user) => {
  let statsData;
  switch (user.role) {
    case Role.SUPER_ADMIN:
    case Role.ADMIN:
      statsData = await getAdminStatsData();
      break;
    case Role.MODERATOR:
      statsData = await getModeratorStatsData(user);
      break;
    case Role.MEMBER:
      statsData = await getMemberStatsData(user);
      break;
    default:
      throw new AppError_default(httpStatus22.BAD_REQUEST, "Invalid user role");
  }
  return statsData;
};
var getAdminStatsData = async () => {
  return await prisma.$transaction(async (tx) => {
    const totalUsers = await tx.user.count({ where: { isDeleted: false } });
    const totalIdeas = await tx.idea.count({ where: { isDeleted: false } });
    const totalCategories = await tx.category.count({ where: { isDeleted: false } });
    const totalTags = await tx.tag.count({ where: { isDeleted: false } });
    const totalPayments = await tx.payment.count();
    const totalSubscriptions = await tx.subscription.count({ where: { isActive: true } });
    const revenueResult = await tx.payment.aggregate({
      _sum: { amount: true },
      where: { status: PaymentStatus.COMPLETED }
    });
    const sixMonthsAgo = /* @__PURE__ */ new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const statusGroups = await tx.idea.groupBy({
      by: ["status"],
      _count: { id: true },
      where: { isDeleted: false }
    });
    const barChartData = await tx.$queryRaw`
            SELECT 
                TO_CHAR(DATE_TRUNC('month', "createdAt"), 'Mon YYYY') AS month,
                CAST(COUNT(*) AS INTEGER) AS count
            FROM "idea"
            WHERE "createdAt" >= ${sixMonthsAgo} AND "isDeleted" = false
            GROUP BY DATE_TRUNC('month', "createdAt")
            ORDER BY DATE_TRUNC('month', "createdAt") ASC;
        `;
    return {
      totalUsers,
      totalIdeas,
      totalCategories,
      totalTags,
      totalPayments,
      totalSubscriptions,
      totalRevenue: revenueResult._sum.amount || 0,
      pieChartData: statusGroups.map((group) => ({
        status: group.status,
        count: group._count.id
      })),
      barChartData
    };
  });
};
var getModeratorStatsData = async (user) => {
  return await prisma.$transaction(async (tx) => {
    const totalReviewsHandled = await tx.ideaReview.count({
      where: { reviewerId: user.userId, isDeleted: false }
    });
    const pendingReviews = await tx.idea.count({
      where: { status: IdeaStatus.UNDER_REVIEW, isDeleted: false }
    });
    const totalSoldIdeas = await tx.ideaPurchase.count();
    const soldRevenueResult = await tx.ideaPurchase.aggregate({
      _sum: { amount: true }
    });
    const statusGroups = await tx.idea.groupBy({
      by: ["status"],
      _count: { id: true },
      where: { authorId: user.userId, isDeleted: false }
    });
    return {
      totalReviewsHandled,
      pendingReviews,
      totalSoldIdeas,
      totalSoldPrices: soldRevenueResult._sum.amount || 0,
      ideaStatusDistribution: statusGroups.map((group) => ({
        status: group.status,
        count: group._count.id
      }))
    };
  });
};
var getMemberStatsData = async (user) => {
  return await prisma.$transaction(async (tx) => {
    const totalMyIdeas = await tx.idea.count({
      where: { authorId: user.userId, isDeleted: false }
    });
    const totalPurchasedIdeas = await tx.ideaPurchase.count({
      where: { userId: user.userId }
    });
    const spentResult = await tx.ideaPurchase.aggregate({
      _sum: { amount: true },
      where: { userId: user.userId }
    });
    const totalFollowers = await tx.follow.count({
      where: { followingId: user.userId }
    });
    const totalFollowing = await tx.follow.count({
      where: { followerId: user.userId }
    });
    const watchlistCount = await tx.watchlist.count({
      where: { userId: user.userId, isDeleted: false }
    });
    return {
      totalMyIdeas,
      totalPurchasedIdeas,
      totalSpent: spentResult._sum.amount || 0,
      totalFollowers,
      totalFollowing,
      watchlistCount
    };
  });
};
var StatsService = {
  getDashboardStatsData
};

// src/app/module/stats/stats.controller.ts
var getDashboardStatsData2 = catchAsync(async (req, res) => {
  const user = req.user;
  const result = await StatsService.getDashboardStatsData(user);
  sendResponse(res, {
    httpStatusCode: httpStatus23.OK,
    success: true,
    message: "Stats data retrieved successfully!",
    data: result
  });
});
var StatsController = {
  getDashboardStatsData: getDashboardStatsData2
};

// src/app/module/stats/stats.route.ts
var router16 = Router14();
router16.get(
  "/dashboard",
  checkAuth(Role.SUPER_ADMIN, Role.ADMIN, Role.MODERATOR, Role.MEMBER),
  StatsController.getDashboardStatsData
);
var StatsRoutes = router16;

// src/app/module/rag/rag.route.ts
import { Router as Router15 } from "express";

// src/app/module/rag/rag.controller.ts
import httpStatus24 from "http-status";

// src/app/module/rag/embeddingService.ts
var EmbeddingService = class {
  apiKey;
  apiUrl = "https://openrouter.ai/api/v1";
  embeddingModel;
  constructor() {
    this.apiKey = envVars.RAG.OPENROUTER_API_KEY || "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";
    this.embeddingModel = envVars.RAG.OPENROUTER_EMBEDDING_MODEL || "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free";
    if (!this.apiKey || !this.embeddingModel) {
      throw new Error("Missing OpenRouter configuration");
    }
  }
  async generateEmbedding(text) {
    try {
      const response = await fetch(`${this.apiUrl}/embeddings`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          input: text,
          model: this.embeddingModel,
          dimensions: 2048
        })
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.log(errorData);
        throw new Error(
          `OpenRouter API error: ${response.status} - ${errorData?.error?.message}`
        );
      }
      const data = await response.json();
      if (!data?.data || data?.data?.length == 0) {
        throw new Error("No embedding data returned");
      }
      return data?.data?.[0]?.embedding;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
};

// src/app/module/rag/indexingService.ts
import { extractText, getDocumentProxy } from "unpdf";
var toVectorLiteral = (vector) => `[${vector.join(",")}]`;
var IndexingService = class {
  embeddingService;
  constructor() {
    this.embeddingService = new EmbeddingService();
  }
  // Helper to fetch and extract text from a remote PDF/URL
  async extractTextFromUrl(url, type) {
    try {
      const response = await fetch(url);
      const buffer = await response.arrayBuffer();
      if (type === "PDF") {
        const pdf = await getDocumentProxy(new Uint8Array(buffer));
        const { text } = await extractText(pdf, { mergePages: true });
        return text;
      }
      return Buffer.from(buffer).toString("utf-8");
    } catch (error) {
      console.error(`Failed to extract text from ${url}:`, error);
      return "";
    }
  }
  async indexDocument(chunkKey, sourceType, sourceId, content, sourceLabel, metadata) {
    try {
      const embedding = await this.embeddingService.generateEmbedding(content);
      const vectorLiteral = toVectorLiteral(embedding);
      await prisma.$executeRaw(prismaNamespace_exports.sql`
                INSERT INTO "document_embeddings"
                (
                  "id", "chunkKey", "sourceType", "sourceId", "sourceLabel", 
                  "content", "metadata", "embedding", "updatedAt"
                )
                VALUES
                (
                  ${prismaNamespace_exports.raw("gen_random_uuid()")},
                  ${chunkKey},
                  ${sourceType},
                  ${sourceId},
                  ${sourceLabel || null},
                  ${content},
                  ${JSON.stringify(metadata || {})}::jsonb,
                  CAST(${vectorLiteral} AS vector),
                  NOW()
                )
                ON CONFLICT ("chunkKey")
                DO UPDATE SET
                  "sourceLabel" = EXCLUDED."sourceLabel",
                  "content" = EXCLUDED."content",
                  "metadata" = EXCLUDED."metadata",
                  "embedding" = EXCLUDED."embedding",
                  "isDeleted" = false,
                  "updatedAt" = NOW()
            `);
    } catch (error) {
      console.error("Indexing Error:", error);
      throw error;
    }
  }
  async indexIdeasData() {
    try {
      console.log("Fetching sustainability ideas with engagement counts...");
      const ideas = await prisma.idea.findMany({
        where: {
          isDeleted: false,
          status: "APPROVED"
        },
        include: {
          categories: { include: { category: true } },
          tags: { include: { tag: true } },
          author: { select: { name: true } },
          // Integrating the relation counts
          _count: {
            select: {
              comments: true,
              votes: true,
              purchases: true,
              watchlists: true
            }
          }
        }
      });
      let indexedCount = 0;
      for (const idea of ideas) {
        const categoriesList = idea.categories.map((ic) => ic.category.name).join(", ");
        const tagsList = idea.tags.map((it) => it.tag.name).join(", ");
        const content = `
                    Title: ${idea.title}
                    Categories: ${categoriesList || "General"}
                    Engagement: ${idea._count.votes} votes, ${idea._count.purchases} supporters, ${idea._count.comments} comments.
                    
                    Problem: 
                    ${idea.problemStatement}
                    
                    Proposed Solution:
                    ${idea.proposedSolution}
                    
                    Description:
                    ${idea.description}
                `.trim();
        const metadata = {
          ideaId: idea.id,
          slug: idea.slug,
          authorName: idea.author?.name,
          isPaid: idea.isPaid,
          price: idea.price,
          trendingScore: idea.trendingScore,
          // Storing counts in metadata for programmatic filtering/ranking
          metrics: {
            votes: idea._count.votes || 0,
            purchases: idea._count.purchases || 0,
            watchlists: idea._count.watchlists || 0,
            comments: idea._count.comments || 0
          }
        };
        const chunkKey = `idea-${idea.id}`;
        await this.indexDocument(
          chunkKey,
          "IDEA",
          idea.id,
          content,
          idea.title,
          metadata
        );
        indexedCount++;
      }
      console.log(`Successfully Indexed ${indexedCount} ideas with metrics.`);
      return {
        success: true,
        indexedCount
      };
    } catch (error) {
      console.error("Batch Indexing Error:", error);
      throw error;
    }
  }
  async indexAttachmentsData() {
    try {
      console.log("Fetching sustainability attachments for deep-scan indexing...");
      const attachments = await prisma.attachment.findMany({
        where: {
          type: { in: ["PDF", "DOCUMENT"] }
          // Skip VIDEO for text indexing
        },
        include: {
          idea: {
            include: {
              _count: {
                select: {
                  votes: true,
                  purchases: true,
                  comments: true
                }
              }
            }
          }
        }
      });
      let indexedCount = 0;
      for (const attachment of attachments) {
        const idea = attachment.idea;
        console.log(`Scanning content for: ${attachment.title || "Untitled Attachment"}`);
        const extractedText = await this.extractTextFromUrl(attachment.url, attachment.type);
        if (!extractedText || extractedText.length < 10) continue;
        const content = `
                    Source: Attachment for "${idea.title}"
                    Attachment Title: ${attachment.title || "Technical Document"}
                    Document Content:
                    ${extractedText.substring(0, 5e3)} // Limit characters for token efficiency
                `.trim();
        const metadata = {
          attachmentId: attachment.id,
          ideaId: idea.id,
          type: attachment.type,
          url: attachment.url,
          parentIdeaTitle: idea.title,
          metrics: {
            votes: idea._count.votes,
            purchases: idea._count.purchases
          }
        };
        const chunkKey = `attachment-${attachment.id}`;
        await this.indexDocument(
          chunkKey,
          "ATTACHMENT",
          attachment.id,
          content,
          attachment.title || idea.title,
          metadata
        );
        indexedCount++;
      }
      console.log(`Successfully scanned and indexed ${indexedCount} attachments.`);
      return {
        success: true,
        indexedCount
      };
    } catch (error) {
      console.error("Batch Attachment Indexing Error:", error);
      throw error;
    }
  }
  async indexPlatformData() {
    try {
      console.log("Indexing EcoVault platform FAQs and description...");
      const platformDescription = `
                    EcoVault Platform Overview

                    EcoVault is a sustainability-focused innovation platform where eco-conscious individuals, students,
                    professionals, and entrepreneurs can share, discover, fund, and collaborate on ideas that protect
                    our environment. The platform is built around community engagement and real-world impact.

                    Core capabilities:
                    - Idea submission: Anyone with a passion for sustainability can publish an idea with a title,
                    problem statement, proposed solution, and supporting attachments (PDFs, images, videos).
                    - Community engagement: Users can upvote ideas they believe in, leave comments, add ideas to
                    watchlists, and purchase/support funded projects.
                    - Funding pipeline: Ideas that gain traction and meet quality criteria become eligible for review
                    by EcoVault's panel of investors and expert mentors. Successful projects receive funding,
                    mentorship, and resources to reach real-world implementation.
                    - Idea lifecycle: Draft \u2192 Under Review \u2192 Approved \u2192 Featured / Funded.
                    - Monetisation: Core community access is free. Premium features and exclusive project details
                    may require a subscription or one-time payment.
                    - Intellectual property: Submitters choose how much detail to expose publicly. EcoVault encourages
                    sharing the "what" and "why" while keeping proprietary implementation details confidential until
                    appropriate protections or partnerships are in place.
                    - Editing: Innovators can edit and refine their ideas at any time after publishing.
                    - Categories & Tags: Ideas are organised by sustainability category and relevant tags to help
                    users discover related innovations.
                    - Trending: Ideas accumulate a trending score based on votes, purchases, watchlists, and comments.

                    EcoVault's mission is to accelerate the transition to a sustainable future by connecting innovators
                    with supporters, mentors, and capital.
            `.trim();
      await this.indexDocument(
        "platform-overview",
        "PLATFORM",
        "platform-overview",
        platformDescription,
        "EcoVault Platform Overview",
        { type: "overview" }
      );
      const knowledgeChunks = [
        {
          key: "what-is-ecovault",
          label: "What is EcoVault?",
          content: `
                        What is EcoVault?

                        EcoVault is an online community portal purpose-built for sustainability. It is a place where
                        community members can share sustainably oriented ideas \u2014 for example, reducing plastic
                        consumption, launching a solar power project, or developing water-recycling systems \u2014 in order
                        to help the environment.

                        At its core EcoVault is three things:
                        1. An idea-sharing hub where anyone can publish eco-friendly innovations with a title, problem
                           statement, proposed solution, description, images, and supporting documents (PDFs, videos).
                        2. A community engagement layer where members explore, upvote, comment on, and watchlist
                           the ideas they care about.
                        3. A funding pipeline where the best ideas are reviewed by admins, mentors, and investors
                           so they can receive real-world support.

                        The platform serves students, professionals, entrepreneurs, and everyday eco-enthusiasts who
                        want to turn sustainability concepts into tangible impact.
                    `.trim()
        },
        {
          key: "why-ecovault",
          label: "Why EcoVault? \u2013 Mission and Purpose",
          content: `
                        Why does EcoVault exist?

                        The world faces accelerating environmental challenges \u2014 climate change, biodiversity loss,
                        pollution, and resource depletion. Many people have innovative solutions but lack a platform
                        to share them, get feedback, and attract funding.

                        EcoVault was created to solve this gap. Its mission is to accelerate the transition to a
                        sustainable future by:
                        - Giving every eco-conscious individual a voice, regardless of background or credentials.
                        - Building a collaborative community where ideas are refined through discussion, upvotes,
                          and expert feedback.
                        - Connecting promising innovations with investors, mentors, and resources so they can move
                          from concept to real-world implementation.
                        - Ensuring transparency and quality through an admin-moderated review pipeline that surfaces
                          the best ideas for the entire community.

                        In short, EcoVault exists because great sustainability ideas deserve a home, an audience,
                        and a path to reality.
                    `.trim()
        },
        {
          key: "how-ecovault-works",
          label: "How EcoVault Works \u2013 Platform Workflow",
          content: `
                        How does EcoVault work?

                        EcoVault follows a structured workflow that takes an idea from a rough draft to a funded,
                        real-world project:

                        Step 1 \u2014 Create & Draft
                        A logged-in member creates an idea by filling in a title, problem statement, proposed
                        solution, detailed description, images, and optional attachments (PDFs, videos). The idea
                        starts in "Draft" mode, visible only to the author. Members can save drafts and come back
                        to refine them before publishing.

                        Step 2 \u2014 Submit for Review
                        When the member is ready, they submit the idea. Its status changes from "Draft" to
                        "Under Review" and enters the admin moderation queue.

                        Step 3 \u2014 Admin Review
                        Admins and Super Admins evaluate the submission for quality, relevance, and sustainability
                        impact. Three outcomes are possible:
                        \u2022 Approve \u2014 the idea becomes publicly visible to the entire community.
                        \u2022 Reject \u2014 the idea is returned to the member with written feedback explaining why it was
                          not approved, so they can revise and resubmit.

                        Step 4 \u2014 Community Engagement
                        Once approved, the idea is live. Community members can:
                        \u2022 Upvote / downvote to signal support.
                        \u2022 Comment to provide feedback and discuss improvements.
                        \u2022 Add to watchlist to track progress.
                        \u2022 Purchase or support funded ideas to contribute resources.

                        Step 5 \u2014 Trending & Discovery
                        Ideas accumulate a trending score based on votes, purchases, watchlists, and comments.
                        High-trending ideas are surfaced prominently so the community can discover the most
                        impactful innovations. Ideas are also organised by categories and tags.

                        Step 6 \u2014 Funding & Mentorship
                        Ideas that gain significant traction become eligible for review by EcoVault's panel of
                        investors and expert mentors. Successful projects receive funding, mentorship, and resources.

                        Editing rules:
                        \u2022 Members can edit or delete their ideas only while they are in Draft or Under Review status.
                        \u2022 Once an idea is Approved and published, the member can still update description, images,
                          and attachments, but cannot delete it.
                    `.trim()
        },
        {
          key: "idea-management-workflow",
          label: "Idea Management \u2013 Roles and Rules",
          content: `
                        Idea Management on EcoVault

                        Only logged-in members can create ideas. The idea lifecycle follows strict rules:

                        Creating an Idea:
                        Members fill in: Title, Problem Statement, Proposed Solution, Description, Images, and
                        optional attachments (PDFs, documents, videos). Each idea is assigned categories and tags
                        for discoverability.

                        Idea Statuses:
                        1. DRAFT \u2014 The idea is saved but not yet submitted. Only the author can see it. The author
                           can freely edit or delete it.
                        2. UNDER_REVIEW \u2014 The idea has been submitted for admin moderation. The author can still
                           edit it, but cannot delete it.
                        3. APPROVED \u2014 An admin has approved the idea. It is now publicly visible. The author can
                           update content but cannot delete it.
                        4. REJECTED \u2014 An admin has rejected the idea with feedback. The author can revise and
                           resubmit it.

                        Admin Actions:
                        \u2022 Admins and Super Admins can view all submitted ideas in the moderation queue.
                        \u2022 They can Approve an idea (status \u2192 APPROVED, becomes public).
                        \u2022 They can Reject an idea (status \u2192 REJECTED, returned with feedback).
                        \u2022 Admins ensure quality, relevance, and alignment with sustainability goals.

                        Paid Ideas:
                        Some ideas may be marked as "paid" with a price. Community members can purchase access
                        to the full details of paid ideas. The author sets the price.

                        Engagement Metrics:
                        Each idea tracks: total votes, total comments, total purchases, and total watchlists.
                        These metrics feed into a trending score that determines visibility on the platform.
                    `.trim()
        }
      ];
      let indexedCount = 1;
      for (const chunk of knowledgeChunks) {
        await this.indexDocument(
          chunk.key,
          "PLATFORM",
          chunk.key,
          chunk.content,
          chunk.label,
          { type: "knowledge" }
        );
        indexedCount++;
      }
      console.log(`Successfully indexed ${indexedCount} platform documents (1 overview + ${knowledgeChunks.length} knowledge).`);
      return {
        success: true,
        indexedCount
      };
    } catch (error) {
      console.error("Platform Indexing Error:", error);
      throw error;
    }
  }
};

// src/app/module/rag/llmService.ts
var LLMService = class {
  apiKey;
  apiUrl = "https://openrouter.ai/api/v1";
  model;
  constructor() {
    this.apiKey = envVars.RAG.OPENROUTER_API_KEY || "";
    this.model = envVars.RAG.OPENROUTER_LLM_MODEL || "nvidia/nemotron-3-super-120b-a12b:free";
    if (!this.apiKey) {
      throw new Error("OpenRouter api key is missing...");
    }
  }
  async generateResponse(prompt, context = [], asJson = false) {
    try {
      let fullPrompt = context.length > 0 ? `Context from EcoVault Database:
${context.join("\n\n")}

User Question: ${prompt}

Instructions: Use the provided context to answer. If the context mentions a 'Paid' idea, emphasize its value but do not reveal restricted internal details unless specified.` : prompt;
      if (asJson) {
        fullPrompt += `

Return ONLY a valid JSON object matching this structure: {
                    "ideas": [
                        {
                            "title": "Idea Title",
                            "summary": "Short 1-sentence summary",
                            "impactScore": "High/Medium/Low based on engagement",
                            "isPaid": true/false
                        }
                    ]
                }. Do not include markdown formatting.`;
      }
      const systemMessage = asJson ? "You are an AI expert for EcoVault, a sustainability community portal. You provide structured data about eco-friendly ideas. You MUST respond with ONLY valid JSON." : "You are the EcoVault Assistant. You help users discover community-driven sustainability ideas, environmental solutions, and green innovations. If the context doesn't contain the answer, politely suggest they browse our categories.";
      const bodyPayload = {
        model: this.model,
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: fullPrompt }
        ],
        temperature: 0.1,
        max_tokens: 1500
      };
      if (asJson && (this.model.includes("gpt") || this.model.includes("openai"))) {
        bodyPayload.response_format = { type: "json_object" };
      }
      const response = await fetch(`${this.apiUrl}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://healthcare-management.local",
          "X-Title": "Healthcare Management System"
        },
        body: JSON.stringify(bodyPayload)
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.log(errorData);
        throw new Error(
          `OpenRouter API error: ${response.status} - ${errorData?.error?.message} || "unknown error"`
        );
      }
      const data = await response.json();
      return data?.choices?.[0]?.message?.content;
    } catch (error) {
      console.error("Error generating LLM response:", error);
      throw error;
    }
  }
};

// src/app/module/rag/rag.service.ts
var RAGService = class {
  embeddingService;
  llmService;
  indexingService;
  constructor() {
    this.embeddingService = new EmbeddingService();
    this.llmService = new LLMService();
    this.indexingService = new IndexingService();
  }
  async ingestIdeasData() {
    return this.indexingService.indexIdeasData();
  }
  async ingestAttachmentsData() {
    return this.indexingService.indexAttachmentsData();
  }
  async ingestPlatformData() {
    return this.indexingService.indexPlatformData();
  }
  async retieveRelevantDocuments(query, limit = 5, sourceType) {
    try {
      const queryEmbedding = await this.embeddingService.generateEmbedding(query);
      const vectorLiteral = `[${queryEmbedding.join(",")}]`;
      const results = await prisma.$queryRaw(prismaNamespace_exports.sql`
          SELECT id, "chunkKey", "sourceType", "sourceId", "sourceLabel", content, metadata, embedding, "isDeleted", "deletedAt", "createdAt", "updatedAt", 1 - (embedding <=> CAST(${vectorLiteral} AS vector)) as similarity
          FROM "document_embeddings"
          WHERE "isDeleted" = false
          ${sourceType ? prismaNamespace_exports.sql`AND "sourceType" = ${sourceType}` : prismaNamespace_exports.empty}
          ORDER BY embedding <=> CAST(${vectorLiteral} AS vector)
          Limit ${limit}
          `);
      return results;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async generateAnswer(query, limit = 5, sourceType, asJson = false) {
    try {
      const relevantDocs = await this.retieveRelevantDocuments(
        query,
        limit,
        sourceType
      );
      const context = relevantDocs.filter((doc) => doc.content).map((doc) => doc.content);
      let answer = await this.llmService.generateResponse(
        query,
        context,
        asJson
      );
      let parsedAnswer = answer;
      if (asJson) {
        try {
          if (answer.startsWith("```json")) {
            answer = answer.replace(/```json\n?/, "").replace(/```$/, "").trim();
          } else if (answer.startsWith("```")) {
            answer = answer.replace(/```\n?/, "").replace(/```$/, "").trim();
          }
          parsedAnswer = JSON.parse(answer);
        } catch (e) {
          console.error("Failed to parse LLM JSON response:", e);
          throw e;
        }
      }
      return {
        answer: parsedAnswer,
        sources: relevantDocs.map((doc) => ({
          id: doc.id,
          chunkKey: doc.chunkKey,
          sourceType: doc.sourceType,
          sourceId: doc.sourceId,
          sourceLabel: doc.sourceLabel,
          content: doc.content,
          similarity: doc.similarity
        })),
        contextUsed: context.length > 0
      };
    } catch (error) {
    }
  }
  async getStats() {
    try {
      const totalDocuments = await prisma.$queryRaw(prismaNamespace_exports.sql`
        SELECT COUNT(*) as count FROM "document_embeddings" WHERE "isDeleted" = false;
        `);
      const sourceTypeCounts = await prisma.$queryRaw(prismaNamespace_exports.sql`
        SELECT "sourceType", COUNT(*) as count FROM "document_embeddings" WHERE "isDeleted" = false GROUP BY "sourceType"
        `);
      return {
        totalActiveDocuments: Number(totalDocuments[0]?.count ?? 0),
        sourceTypeBreakdown: sourceTypeCounts.reduce(
          (acc, curr) => {
            acc[curr.sourceType] = Number(curr.count);
            return acc;
          },
          {}
        ),
        timestamp: /* @__PURE__ */ new Date()
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
};

// src/app/lib/redis.ts
import { createClient } from "redis";
var RedisService = class {
  client = null;
  isConnected = false;
  async connect() {
    try {
      const redisUrl = envVars.REDIS_URL;
      if (redisUrl) {
        this.client = createClient({ url: redisUrl });
      } else {
        const host = process.env.REDIS_HOST || "localhost";
        const port2 = parseInt(process.env.REDIS_PORT || "6379", 10);
        const password = process.env.REDIS_PASSWORD || void 0;
        this.client = createClient({
          socket: {
            host,
            port: port2
          },
          ...password && { password }
        });
      }
      this.client.on("error", (err) => {
        console.error("Redis Client Error:", err);
        this.isConnected = false;
      });
      this.client.on("connect", () => {
        console.log("Redis Client Connected");
        this.isConnected = true;
      });
      this.client.on("ready", () => {
        console.log("Redis Client Ready");
        this.isConnected = true;
      });
      this.client.on("end", () => {
        console.log("Redis Client Disconnected");
        this.isConnected = false;
      });
      this.client.on("reconnecting", () => {
        console.log("Redis Client Reconnecting");
      });
      await this.client.connect();
    } catch (error) {
      console.error("Failed to connect to Redis:", error);
      this.isConnected = false;
    }
  }
  ensureConnection() {
    if (!this.client) {
      throw new Error("Redis client not initialized. Call connect() first.");
    }
    if (!this.isConnected) {
      throw new Error("Redis client not connected.");
    }
    return this.client;
  }
  async get(key) {
    try {
      const client = this.ensureConnection();
      return await client.get(key);
    } catch (error) {
      console.error("Redis GET error:", error);
      return null;
    }
  }
  async set(key, value, ttlInSeconds) {
    try {
      const client = this.ensureConnection();
      const stringValue = typeof value === "string" ? value : JSON.stringify(value);
      await client.set(key, stringValue, { EX: ttlInSeconds });
    } catch (error) {
      console.error("Redis SET error:", error);
    }
  }
  async update(key, value, ttlInSeconds) {
    await this.set(key, value, ttlInSeconds);
  }
  async delete(key) {
    try {
      const client = this.ensureConnection();
      await client.del(key);
    } catch (error) {
      console.error("Redis DELETE error:", error);
    }
  }
  async isAvailable() {
    try {
      const client = this.ensureConnection();
      await client.ping();
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
  async disconnect() {
    if (this.client && this.isConnected) {
      await this.client.quit();
      this.isConnected = false;
    }
  }
};
var redisService = new RedisService();

// src/app/module/rag/rag.controller.ts
var ragService = new RAGService();
var getStats = catchAsync(async (req, res) => {
  const result = await ragService.getStats();
  sendResponse(res, {
    httpStatusCode: httpStatus24.OK,
    success: true,
    message: "connected rag api",
    data: result
  });
});
var ingestIdeasData = catchAsync(async (req, res) => {
  const result = await ragService.ingestIdeasData();
  sendResponse(res, {
    httpStatusCode: httpStatus24.OK,
    success: true,
    message: "ingest ideas data successfully",
    data: result
  });
});
var ingestAttachmentsData = catchAsync(async (req, res) => {
  const result = await ragService.ingestAttachmentsData();
  sendResponse(res, {
    httpStatusCode: httpStatus24.OK,
    success: true,
    message: "ingest attachments data successfully",
    data: result
  });
});
var ingestPlatformData = catchAsync(async (req, res) => {
  const result = await ragService.ingestPlatformData();
  sendResponse(res, {
    httpStatusCode: httpStatus24.OK,
    success: true,
    message: "Platform FAQs and description indexed successfully",
    data: result
  });
});
var qyeryRag = catchAsync(async (req, res) => {
  const { query, limit, sourceType } = req.body;
  if (!query) {
    throw sendResponse(res, {
      httpStatusCode: httpStatus24.BAD_REQUEST,
      success: false,
      message: "query is required"
    });
  }
  const cacheKey = `rag:query:${query}:${limit ?? 5}:${sourceType || "all"}`;
  try {
    const cachedResult = await redisService.get(cacheKey);
    if (cachedResult) {
      const parsedData = JSON.parse(cachedResult);
      sendResponse(res, {
        success: true,
        httpStatusCode: httpStatus24.OK,
        message: "Answer retrieved from cache",
        data: parsedData
      });
      return;
    }
  } catch (cacheError) {
    console.warn("Cache read error, proceeding with normal processing:", cacheError);
  }
  const result = await ragService.generateAnswer(query, limit, sourceType);
  try {
    await redisService.set(cacheKey, result, 1800);
  } catch (cacheError) {
    console.warn("Cache write error:", cacheError);
  }
  sendResponse(res, {
    httpStatusCode: httpStatus24.OK,
    success: true,
    message: "query doctors data successfully",
    data: result
  });
});
var RagController = {
  getStats,
  ingestIdeasData,
  ingestAttachmentsData,
  ingestPlatformData,
  qyeryRag
};

// src/app/module/rag/rag.route.ts
var router17 = Router15();
router17.get("/stats", RagController.getStats);
router17.post("/ingest-ideas", RagController.ingestIdeasData);
router17.post("/ingest-attachments", RagController.ingestAttachmentsData);
router17.post("/ingest-platform", RagController.ingestPlatformData);
router17.post("/query", RagController.qyeryRag);
var RagRoutes = router17;

// src/app/routes/index.ts
var router18 = Router16();
router18.use("/auth", AuthRoutes);
router18.use("/admins", AdminRoutes);
router18.use("/categories", CategoryRoutes);
router18.use("/tags", TagRoutes);
router18.use("/ideas", IdeaRoutes);
router18.use("/comments", CommentRoutes);
router18.use("/votes", VoteRoutes);
router18.use("/follows", FollowRoutes);
router18.use("/watchlists", WatchlistRoutes);
router18.use("/attachments", AttachmentRoutes);
router18.use("/idea-reviews", IdeaReviewRoutes);
router18.use("/moderators", ModeratorRoutes);
router18.use("/payments", PaymentRoutes);
router18.use("/subscriptions", SubscriptionRoutes);
router18.use("/members", MemberRoutes);
router18.use("/stats", StatsRoutes);
router18.use("/rag", RagRoutes);
var IndexRoutes = router18;

// src/app/middleware/notFound.ts
import status13 from "http-status";
var notFound = (req, res) => {
  res.status(status13.NOT_FOUND).json({
    success: false,
    message: `Route ${req.originalUrl} Not Found`
  });
};

// src/app/middleware/globalErrorHandler.ts
import status16 from "http-status";
import z16 from "zod";

// src/app/errorHelpers/handleZodError.ts
import status14 from "http-status";
var handleZodError = (err) => {
  const statusCode = status14.BAD_REQUEST;
  const message = "Zod Validation Error";
  const errorSources = [];
  err.issues.forEach((issue) => {
    errorSources.push({
      path: issue.path.join(" => "),
      message: issue.message
    });
  });
  return {
    success: false,
    message,
    errorSources,
    statusCode
  };
};

// src/app/utils/deleteUploadedFilesFromGlobalErrorHandler.ts
var deleteUploadedFilesFromGlobalErrorHandler = async (req) => {
  try {
    const filesToDelete = [];
    if (req.file && req.file?.path) {
      filesToDelete.push(req.file.path);
    } else if (req.files && typeof req.files === "object" && !Array.isArray(req.files)) {
      Object.values(req.files).forEach((fileArray) => {
        if (Array.isArray(fileArray)) {
          fileArray.forEach((file) => {
            if (file.path) {
              filesToDelete.push(file.path);
            }
          });
        }
      });
    } else if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      req.files.forEach((file) => {
        if (file.path) {
          filesToDelete.push(file.path);
        }
      });
    }
    if (filesToDelete.length > 0) {
      await Promise.all(
        filesToDelete.map((url) => deleteFileFromCloudinary(url))
      );
      console.log(`
Deleted ${filesToDelete.length} uploaded file(s) from Cloudinary due to an error during request processing.
`);
    }
  } catch (error) {
    console.error("Error deleting uploaded files from Global Error Handler", error);
  }
};

// src/app/errorHelpers/handlePrismaErrors.ts
import status15 from "http-status";
var getStatusCodeFromPrismaError = (errorCode) => {
  if (errorCode === "P2002") {
    return status15.CONFLICT;
  }
  if (["P2025", "P2001", "P2015", "P2018"].includes(errorCode)) {
    return status15.NOT_FOUND;
  }
  if (["P1000", "P6002"].includes(errorCode)) {
    return status15.UNAUTHORIZED;
  }
  if (["P1010", "P6010"].includes(errorCode)) {
    return status15.FORBIDDEN;
  }
  if (errorCode === "P6003") {
    return status15.PAYMENT_REQUIRED;
  }
  if (["P1008", "P2004", "P6004"].includes(errorCode)) {
    return status15.GATEWAY_TIMEOUT;
  }
  if (errorCode === "P5011") {
    return status15.TOO_MANY_REQUESTS;
  }
  if (errorCode === "P6009") {
    return 413;
  }
  if (errorCode.startsWith("P1") || ["P2024", "P2037", "P6008"].includes(errorCode)) {
    return status15.SERVICE_UNAVAILABLE;
  }
  if (errorCode.startsWith("P2")) {
    return status15.BAD_REQUEST;
  }
  if (errorCode.startsWith("P3") || errorCode.startsWith("P4")) {
    return status15.INTERNAL_SERVER_ERROR;
  }
  return status15.INTERNAL_SERVER_ERROR;
};
var formatErrorMeta = (meta) => {
  if (!meta) return "";
  const parts = [];
  if (meta.target) {
    parts.push(`Field(s): ${String(meta.target)}`);
  }
  if (meta.field_name) {
    parts.push(`Field: ${String(meta.field_name)}`);
  }
  if (meta.column_name) {
    parts.push(`Column: ${String(meta.column_name)}`);
  }
  if (meta.table) {
    parts.push(`Table: ${String(meta.table)}`);
  }
  if (meta.model_name) {
    parts.push(`Model: ${String(meta.model_name)}`);
  }
  if (meta.relation_name) {
    parts.push(`Relation: ${String(meta.relation_name)}`);
  }
  if (meta.constraint) {
    parts.push(`Constraint: ${String(meta.constraint)}`);
  }
  if (meta.database_error) {
    parts.push(`Database Error: ${String(meta.database_error)}`);
  }
  return parts.length > 0 ? parts.join(" |") : "";
};
var handlePrismaClientKnownRequestError = (error) => {
  const statusCode = getStatusCodeFromPrismaError(error.code);
  const metaInfo = formatErrorMeta(error.meta);
  let cleanMessage = error.message;
  cleanMessage = cleanMessage.replace(/Invalid `.*?` invocation:?\s*/i, "");
  const lines = cleanMessage.split("\n").filter((line) => line.trim());
  const mainMessage = lines[0] || "An error occurred with the database operation.";
  const errorSources = [
    {
      path: error.code,
      message: metaInfo ? `${mainMessage} | ${metaInfo}` : mainMessage
    }
  ];
  if (error.meta?.cause) {
    errorSources.push({
      path: "cause",
      message: String(error.meta.cause)
    });
  }
  return {
    success: false,
    statusCode,
    message: `Prisma Client Known Request Error: ${mainMessage}`,
    errorSources
  };
};
var handlePrismaClientUnknownError = (error) => {
  let cleanMessage = error.message;
  cleanMessage = cleanMessage.replace(/Invalid `.*?` invocation:?\s*/i, "");
  const lines = cleanMessage.split("\n").filter((line) => line.trim());
  const mainMessage = lines[0] || "An unknown error occurred with the database operation.";
  const errorSources = [
    {
      path: "Unknown Prisma Error",
      message: mainMessage
    }
  ];
  return {
    success: false,
    statusCode: status15.INTERNAL_SERVER_ERROR,
    message: `Prisma Client Unknown Request Error: ${mainMessage}`,
    errorSources
  };
};
var handlePrismaClientValidationError = (error) => {
  let cleanMessage = error.message;
  cleanMessage = cleanMessage.replace(/Invalid `.*?` invocation:?\s*/i, "");
  const lines = cleanMessage.split("\n").filter((line) => line.trim());
  const errorSources = [];
  const fieldMatch = cleanMessage.match(/Argument `(\w+)`/i);
  const fieldName = fieldMatch ? fieldMatch[1] : "Unknown Field";
  const mainMessage = lines.find(
    (line) => !line.includes("Argument") && !line.includes("\u2192") && line.length > 10
  ) || lines[0] || "Invalid query parameters provided to the database operation.";
  errorSources.push({
    path: fieldName,
    message: mainMessage
  });
  return {
    success: false,
    statusCode: status15.BAD_REQUEST,
    message: `Prisma Client Validation Error: ${mainMessage}`,
    errorSources
  };
};
var handlerPrismaClientInitializationError = (error) => {
  const statusCode = error.errorCode ? getStatusCodeFromPrismaError(error.errorCode) : status15.SERVICE_UNAVAILABLE;
  const cleanMessage = error.message;
  cleanMessage.replace(/Invalid `.*?` invocation:?\s*/i, "");
  const lines = cleanMessage.split("\n").filter((line) => line.trim());
  const mainMessage = lines[0] || "An error occurred while initializing the Prisma Client.";
  const errorSources = [
    {
      path: error.errorCode || "Initialization Error",
      message: mainMessage
    }
  ];
  return {
    success: false,
    statusCode,
    message: `Prisma Client Initialization Error: ${mainMessage}`,
    errorSources
  };
};
var handlerPrismaClientRustPanicError = () => {
  const errorSources = [{
    path: "Rust Engine Crashed",
    message: "The database engine encountered a fatal error and crashed. This is usually due to an internal bug in the Prisma engine or an unexpected edge case in the database operation. Please check the Prisma logs for more details and consider reporting this issue to the Prisma team if it persists."
  }];
  return {
    success: false,
    statusCode: status15.INTERNAL_SERVER_ERROR,
    message: "Prisma Client Rust Panic Error: The database engine crashed due to a fatal error.",
    errorSources
  };
};

// src/app/middleware/globalErrorHandler.ts
var globalErrorHandler = async (err, req, res, next) => {
  if (envVars.NODE_ENV === "development") {
    console.log("Error from Global Error Handler", err);
  }
  await deleteUploadedFilesFromGlobalErrorHandler(req);
  let errorSources = [];
  let statusCode = status16.INTERNAL_SERVER_ERROR;
  let message = "Internal Server Error";
  let stack = void 0;
  if (err instanceof prismaNamespace_exports.PrismaClientKnownRequestError) {
    const simplifiedError = handlePrismaClientKnownRequestError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = [...simplifiedError.errorSources];
    stack = err.stack;
  } else if (err instanceof prismaNamespace_exports.PrismaClientUnknownRequestError) {
    const simplifiedError = handlePrismaClientUnknownError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = [...simplifiedError.errorSources];
    stack = err.stack;
  } else if (err instanceof prismaNamespace_exports.PrismaClientValidationError) {
    const simplifiedError = handlePrismaClientValidationError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = [...simplifiedError.errorSources];
    stack = err.stack;
  } else if (err instanceof prismaNamespace_exports.PrismaClientRustPanicError) {
    const simplifiedError = handlerPrismaClientRustPanicError();
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = [...simplifiedError.errorSources];
    stack = err.stack;
  } else if (err instanceof prismaNamespace_exports.PrismaClientInitializationError) {
    const simplifiedError = handlerPrismaClientInitializationError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = [...simplifiedError.errorSources];
    stack = err.stack;
  } else if (err instanceof z16.ZodError) {
    const simplifiedError = handleZodError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = [...simplifiedError.errorSources];
    stack = err.stack;
  } else if (err instanceof AppError_default) {
    statusCode = err.statusCode;
    message = err.message;
    stack = err.stack;
    errorSources = [
      {
        path: "",
        message: err.message
      }
    ];
  } else if (err instanceof Error) {
    statusCode = status16.INTERNAL_SERVER_ERROR;
    message = err.message;
    stack = err.stack;
    errorSources = [
      {
        path: "",
        message: err.message
      }
    ];
  }
  const errorResponse = {
    success: false,
    message,
    errorSources,
    error: envVars.NODE_ENV === "development" ? err : void 0,
    stack: envVars.NODE_ENV === "development" ? stack : void 0
  };
  res.status(statusCode).json(errorResponse);
};

// src/app.ts
var app = express10();
app.set("query parser", (str) => qs.parse(str));
app.set("view engine", "ejs");
app.set("views", path3.resolve(process.cwd(), `src/app/templates`));
var allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5000",
  "https://ecovault-server.vercel.app",
  envVars.FRONTEND_URL,
  "https://ecovault-client.vercel.app"
].filter(Boolean);
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const isAllowed = allowedOrigins.includes(origin) || /^https:\/\/.*\.vercel\.app$/.test(origin);
      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposedHeaders: ["Set-Cookie"]
  })
);
app.use("/api/auth", toNodeHandler(auth));
app.post(
  "/api/v1/payments/webhook/stripe",
  express10.raw({ type: "application/json" }),
  PaymentController.handleStripeWebhookEvent
);
app.use(express10.urlencoded({ extended: true }));
app.use(express10.json());
app.use(cookieParser());
app.get("/", async (req, res) => {
  res.status(201).json({
    success: true,
    message: "API is working"
  });
});
app.use("/api/v1", IndexRoutes);
app.use(globalErrorHandler);
app.use(notFound);
var app_default = app;

// src/app/utils/seed.ts
var seedSuperAdmin = async () => {
  try {
    const isSuperAdminExist = await prisma.user.findFirst({
      where: {
        role: Role.SUPER_ADMIN
      }
    });
    if (isSuperAdminExist) {
      console.log("Super admin already exists. Skipping seeding super admin.");
      return;
    }
    const superAdminUser = await auth.api.signUpEmail({
      body: {
        email: envVars.SUPER_ADMIN_EMAIL,
        password: envVars.SUPER_ADMIN_PASSWORD,
        name: "Super Admin",
        role: Role.SUPER_ADMIN,
        needPasswordChange: false,
        rememberMe: false
      }
    });
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: {
          id: superAdminUser.user.id
        },
        data: {
          emailVerified: true
        }
      });
      await tx.admin.create({
        data: {
          userId: superAdminUser.user.id,
          name: "Super Admin",
          email: envVars.SUPER_ADMIN_EMAIL
        }
      });
    });
    const superAdmin = await prisma.admin.findFirst({
      where: {
        email: envVars.SUPER_ADMIN_EMAIL
      },
      include: {
        user: true
      }
    });
    console.log("Super Admin Created ", superAdmin);
  } catch (error) {
    console.error("Error seeding super admin: ", error);
    await prisma.user.delete({
      where: {
        email: envVars.SUPER_ADMIN_EMAIL
      }
    });
  }
};

// src/server.ts
var port = envVars.PORT || 5e3;
var server;
var bootstrap = async () => {
  try {
    await seedSuperAdmin();
    await redisService.connect();
    server = app_default.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
  }
};
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received. Shutting down server...");
  if (server) {
    server.close(() => {
      console.log("Server closed gracefully.");
      process.exit(1);
    });
  }
  process.exit(1);
});
process.on("SIGINT", () => {
  console.log("SIGINT signal received.");
  if (server) {
    server.close(() => {
      console.log("Server closed gracefully.");
      process.exit(0);
    });
  } else {
    process.exit(1);
  }
});
process.on("uncaughtException", (error) => {
  console.log("Uncaught Exception Detected... Shutting down server", error);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});
process.on("unhandledRejection", (error) => {
  console.log("Unhandled Rejection Detected... Shutting down server", error);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});
bootstrap();
