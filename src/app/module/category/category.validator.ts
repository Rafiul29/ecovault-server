import z from "zod";

export const createCategoryZodSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters long"),
    slug: z.string().min(2, "Slug must be at least 2 characters long").optional(),
    description: z.string().max(500, "Description must be 500 characters or less").optional(),
    icon: z.string().url("Icon must be a valid URL").optional(),
    color: z.string().min(3, "Color must be a valid color").optional(),
    isActive: z.boolean().optional(),
});

export const updateCategoryZodSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters long").optional(),
    slug: z.string().min(2, "Slug must be at least 2 characters long").optional(),
    description: z.string().max(500, "Description must be 500 characters or less").optional(),
    icon: z.string().url("Icon must be a valid URL").optional(),
    color: z.string().min(3, "Color must be a valid color").optional(),
    isActive: z.boolean().optional(),
});
