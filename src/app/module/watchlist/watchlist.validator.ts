import { z } from "zod";

export const watchlistZodSchema = z.object({

  ideaId: z.string().min(1, "Idea ID is required"),

});
