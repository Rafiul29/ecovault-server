import { z } from "zod";

export const createAttachmentZodSchema = z.object({
  body: z.object({
    type: z.enum(["VIDEO", "PDF", "DOCUMENT"]),
    url: z.string().url("Valid URL is required"),
    title: z.string().optional(),
    ideaId: z.string().min(1, "Idea ID is required"),
  }),
});

export const updateAttachmentZodSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    url: z.string().url("Valid URL is required").optional(),
  }),
});
