import { z } from "zod";
import { ReactionType } from "../../../generated/prisma/enums";

export const createCommentZodSchema = z.object({
  content: z.string().min(1, "Content is required"),
  ideaId: z.string().min(1, "Idea ID is required"),
  parentId: z.string().optional(),
});

export const updateCommentZodSchema = z.object({
  content: z.string().min(1, "Content string is required"),
});

export const commentReactionZodSchema = z.object({
  commentId: z.string().min(1, "Comment ID is required"),
  type: z.enum(Object.values(ReactionType) as [string, ...string[]]),
});
