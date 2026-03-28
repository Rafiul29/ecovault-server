import z from "zod";

export const createTagZodSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters long"),
    slug: z.string().min(2, "Slug must be at least 2 characters long").optional(),
});

export const updateTagZodSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters long").optional(),
    slug: z.string().min(2, "Slug must be at least 2 characters long").optional(),
});
