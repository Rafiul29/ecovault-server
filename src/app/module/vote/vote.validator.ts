import { z } from "zod";

export const voteZodSchema = z.object({
  body: z.object({
    ideaId: z.string().min(1, "Idea ID is required"),
    value: z.number().refine((v) => v === 1 || v === -1, {
      message: "Vote value must be 1 (upvote) or -1 (downvote)",
    }),
  }),
});
