import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelpers/AppError";
import { IAttachmentPayload } from "./attachment.interface";

const createAttachment = async (payload: IAttachmentPayload, userId: string, role: string) => {
  const { ideaId, type, url, title } = payload;

  const idea = await prisma.idea.findUnique({ where: { id: ideaId } });
  if (!idea) {
    throw new AppError(httpStatus.NOT_FOUND, "Idea not found");
  }

  // Only author or admin/moderator can add attachments
  if (idea.authorId !== userId && role !== "ADMIN" && role !== "SUPER_ADMIN" && role !== "MODERATOR") {
    throw new AppError(httpStatus.FORBIDDEN, "You don't have permission to add attachments to this idea");
  }

  const attachment = await prisma.attachment.create({
    data: { ideaId, type, url, title: title ?? null },
  });

  return attachment;
};

const getAttachmentsByIdea = async (ideaId: string) => {
  const list = await prisma.attachment.findMany({
    where: { ideaId },
    orderBy: { createdAt: "desc" },
  });

  return list;
};

const deleteAttachment = async (id: string, userId: string, role: string) => {
  const attachment = await prisma.attachment.findUnique({
    where: { id },
    include: { idea: true },
  });

  if (!attachment) {
    throw new AppError(httpStatus.NOT_FOUND, "Attachment not found");
  }

  // Only author or admin/moderator can delete
  if (attachment.idea.authorId !== userId && role !== "ADMIN" && role !== "SUPER_ADMIN" && role !== "MODERATOR") {
    throw new AppError(httpStatus.FORBIDDEN, "You don't have permission to delete this attachment");
  }

  await prisma.attachment.delete({
    where: { id },
  });

  return { message: "Attachment deleted successfully" };
};

export const AttachmentService = {
  createAttachment,
  getAttachmentsByIdea,
  deleteAttachment,
};
