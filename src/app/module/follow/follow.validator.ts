import { z } from "zod";

export const followZodSchema = z.object({
  body: z.object({
    followingId: z.string().min(1, "Following ID is required"),
  }),
});
