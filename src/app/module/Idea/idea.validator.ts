import z from "zod";

export const createIdeaZodSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    slug: z.string().min(3, "Slug must be at least 3 characters").optional(),
    description: z.string().min(10, "Description must be at least 10 characters"),
    problemStatement: z.string().min(10, "Problem statement must be at least 10 characters"),
    proposedSolution: z.string().min(10, "Proposed solution must be at least 10 characters"),
    images: z.array(z.string().url("Each image must be a valid URL")).optional(),
    categories: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    status: z.enum(["DRAFT", "UNDER_REVIEW", "APPROVED", "REJECTED"]).optional(),
    isPaid: z.boolean().optional(),
    price: z.number().min(0).optional(),
    isFeatured: z.boolean().optional(),
});

export const updateIdeaZodSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters").optional(),
    slug: z.string().min(3, "Slug must be at least 3 characters").optional(),
    description: z.string().min(10, "Description must be at least 10 characters").optional(),
    problemStatement: z.string().min(10, "Problem statement must be at least 10 characters").optional(),
    proposedSolution: z.string().min(10, "Proposed solution must be at least 10 characters").optional(),
    images: z.array(z.string().url("Each image must be a valid URL")).optional(),
    categories: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    status: z.enum(["DRAFT", "UNDER_REVIEW", "APPROVED", "REJECTED"]).optional(),
    isPaid: z.boolean().optional(),
    price: z.number().min(0).optional(),
    isFeatured: z.boolean().optional(),
});
