import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelpers/AppError";
import { IIdeaReviewPayload } from "./ideaReview.interface";

const createIdeaReview = async (payload: IIdeaReviewPayload, reviewerId: string) => {
  const { ideaId, status, feedback } = payload;

  const idea = await prisma.idea.findUnique({ where: { id: ideaId } });
  if (!idea) {
    throw new AppError(httpStatus.NOT_FOUND, "Idea not found");
  }

  // Use transaction to update idea status and record the review
  const result = await prisma.$transaction(async (tx) => {
    // 1. Update Idea status and administrative fields
    const updatedIdea = await tx.idea.update({
      where: { id: ideaId },
      data: {
        status,
        adminFeedback: feedback,
        reviewedBy: reviewerId,
        reviewedAt: new Date(),
        publishedAt: status === "APPROVED" ? new Date() : null,
      },
    });

    // 2. Create the Review record
    const review = await tx.ideaReview.create({
      data: {
        ideaId,
        reviewerId,
        status,
        feedback,
      },
    });

    return { updatedIdea, review };
  });

  return result;
};

const getReviewHistoryByIdea = async (ideaId: string) => {
  const list = await prisma.ideaReview.findMany({
    where: { ideaId, isDeleted: false },
    include: {
      reviewer: { select: { id: true, name: true, role: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return list;
};

export const IdeaReviewService = {
  createIdeaReview,
  getReviewHistoryByIdea,
};
