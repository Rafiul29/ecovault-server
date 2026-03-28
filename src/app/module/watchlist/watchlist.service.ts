import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelpers/AppError";

const toggleWatchlist = async (userId: string, ideaId: string) => {
  const idea = await prisma.idea.findUnique({ where: { id: ideaId } });
  if (!idea) {
    throw new AppError(httpStatus.NOT_FOUND, "Idea not found");
  }

  const existing = await prisma.watchlist.findUnique({
    where: { userId_ideaId: { userId, ideaId } },
  });

  if (existing) {
    if (existing.isDeleted) {
      // Re-enable it
      await prisma.watchlist.update({
        where: { userId_ideaId: { userId, ideaId } },
        data: { isDeleted: false, deletedAt: null },
      });
      return { action: "added" };
    } else {
      // Soft Delete
      await prisma.watchlist.update({
        where: { userId_ideaId: { userId, ideaId } },
        data: { isDeleted: true, deletedAt: new Date() },
      });
      return { action: "removed" };
    }
  }

  // Create new
  await prisma.watchlist.create({
    data: { userId, ideaId },
  });

  return { action: "added" };
};

const getMyWatchlist = async (userId: string) => {
  const list = await prisma.watchlist.findMany({
    where: { userId, isDeleted: false },
    include: {
      idea: {
        include: {
          categories: { include: { category: true } },
          tags: { include: { tag: true } },
          _count: { select: { votes: true, comments: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return list;
};

export const WatchlistService = {
  toggleWatchlist,
  getMyWatchlist,
};
