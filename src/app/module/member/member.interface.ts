import z from "zod";

export const updateMemberZodSchema = z.object({
    name: z.string().optional(),
    image: z.string().optional(),
});