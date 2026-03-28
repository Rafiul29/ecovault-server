import { z } from "zod";

export const createIdeaReviewZodSchema = z.object({
  body: z.object({
    ideaId: z.string().min(1, "Idea ID is required"),
    status: z.enum(["UNDER_REVIEW", "APPROVED", "REJECTED"]),
    feedback: z.string().min(5, "Feedback must be at least 5 characters"),
  }),
});
