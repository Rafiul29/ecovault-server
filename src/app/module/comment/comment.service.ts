import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelpers/AppError";
import { ICommentPayload, ICommentReactionPayload } from "./comment.interface";

const createComment = async (payload: ICommentPayload, authorId: string) => {
  const { content, ideaId, parentId } = payload;

  const idea = await prisma.idea.findUnique({ where: { id: ideaId } });
  if (!idea) {
    throw new AppError(httpStatus.NOT_FOUND, "Idea not found");
  }

  if (parentId) {
    const parentComment = await prisma.comment.findUnique({ where: { id: parentId } });
    if (!parentComment) {
      throw new AppError(httpStatus.NOT_FOUND, "Parent comment not found");
    }
  }

  const comment = await prisma.comment.create({
    data: {
      content,
      ideaId,
      authorId,
      parentId: parentId || null,
    },
    include: {
      author: { select: { id: true, name: true, image: true } },
    },
  });

  return comment;
};

const getCommentsByIdea = async (ideaId: string) => {
  const comments = await prisma.comment.findMany({
    where: { ideaId, parentId: null, isDeleted: false },
    include: {
      author: { select: { id: true, name: true, image: true } },
      replies: {
        where: { isDeleted: false },
        include: {
          author: { select: { id: true, name: true, image: true } },
          reactions: true,
        },
      },
      reactions: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return comments;
};

const updateComment = async (id: string, content: string, authorId: string) => {
  const comment = await prisma.comment.findUnique({ where: { id } });
  if (!comment || comment.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, "Comment not found");
  }

  if (comment.authorId !== authorId) {
    throw new AppError(httpStatus.FORBIDDEN, "You can only edit your own comments");
  }

  return await prisma.comment.update({
    where: { id },
    data: { content },
  });
};

const deleteComment = async (id: string, authorId: string, userRole: string) => {
  const comment = await prisma.comment.findUnique({ where: { id } });
  if (!comment) {
    throw new AppError(httpStatus.NOT_FOUND, "Comment not found");
  }

  if (comment.authorId !== authorId && userRole !== "ADMIN" && userRole !== "SUPER_ADMIN" && userRole !== "MODERATOR") {
    throw new AppError(httpStatus.FORBIDDEN, "You don't have permission to delete this comment");
  }

  return await prisma.comment.update({
    where: { id },
    data: { isDeleted: true },
  });
};

const toggleCommentReaction = async (payload: ICommentReactionPayload, userId: string) => {
  const { commentId, type } = payload;

  const existingReaction = await prisma.commentReaction.findUnique({
    where: { userId_commentId: { userId, commentId } },
  });

  if (existingReaction) {
    if (existingReaction.type === type) {
      // Remove reaction if same type
      await prisma.commentReaction.delete({
        where: { userId_commentId: { userId, commentId } },
      });
      return { action: "removed" };
    } else {
      // Update reaction if different type
      await prisma.commentReaction.update({
        where: { userId_commentId: { userId, commentId } },
        data: { type },
      });
      return { action: "updated" };
    }
  }

  await prisma.commentReaction.create({
    data: { userId, commentId, type },
  });

  return { action: "added" };
};

export const CommentService = {
  createComment,
  getCommentsByIdea,
  updateComment,
  deleteComment,
  toggleCommentReaction,
};
