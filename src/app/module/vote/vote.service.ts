import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelpers/AppError";
import { IVotePayload } from "./vote.interface";

const toggleVote = async (payload: IVotePayload, userId: string) => {
  const { ideaId, value } = payload;

  const idea = await prisma.idea.findUnique({ where: { id: ideaId } });
  if (!idea) {
    throw new AppError(httpStatus.NOT_FOUND, "Idea not found");
  }

  const existingVote = await prisma.vote.findUnique({
    where: { userId_ideaId: { userId, ideaId } },
  });

  return await prisma.$transaction(async (tx) => {
    if (existingVote) {
      if (existingVote.value === value) {
        // Remove vote if same value (toggle off)
        await tx.vote.delete({
          where: { userId_ideaId: { userId, ideaId } },
        });

        // Update Idea counter
        await tx.idea.update({
          where: { id: ideaId },
          data: {
            [value === 1 ? "upvoteCount" : "downvoteCount"]: { decrement: 1 },
          },
        });

        return { action: "removed", value: 0 };
      } else {
        // Switch vote type
        const updatedVote = await tx.vote.update({
          where: { userId_ideaId: { userId, ideaId } },
          data: { value },
        });

        // Update Idea counters (one decrement, one increment)
        await tx.idea.update({
          where: { id: ideaId },
          data: {
            upvoteCount: { [value === 1 ? "increment" : "decrement"]: 1 },
            downvoteCount: { [value === -1 ? "increment" : "decrement"]: 1 },
          },
        });

        return { action: "updated", value: updatedVote.value };
      }
    }

    // Create new vote
    const newVote = await tx.vote.create({
      data: { userId, ideaId, value },
    });

    // Update Idea counter
    await tx.idea.update({
      where: { id: ideaId },
      data: {
        [value === 1 ? "upvoteCount" : "downvoteCount"]: { increment: 1 },
      },
    });

    return { action: "added", value: newVote.value };
  });
};

const getIdeaVotesSummary = async (ideaId: string) => {
  const idea = await prisma.idea.findUnique({
    where: { id: ideaId },
    select: { upvoteCount: true, downvoteCount: true },
  });

  if (!idea) {
    throw new AppError(httpStatus.NOT_FOUND, "Idea not found");
  }

  return {
    upvotes: idea.upvoteCount,
    downvotes: idea.downvoteCount,
    score: idea.upvoteCount - idea.downvoteCount,
  };
};

export const VoteService = {
  toggleVote,
  getIdeaVotesSummary,
};
