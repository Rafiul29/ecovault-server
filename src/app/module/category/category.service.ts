import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { ICreateCategoryPayload, IUpdateCategoryPayload } from "./category.interface";

const getAllCategories = async () => {
    const categories = await prisma.category.findMany({
        orderBy: { createdAt: "desc" }
    });
    return categories;
};

const getCategoryById = async (id: string) => {
    const category = await prisma.category.findUnique({
        where: { id },
    });

    if (!category) {
        throw new AppError(status.NOT_FOUND, "Category not found");
    }

    return category;
};

const createCategory = async (payload: ICreateCategoryPayload) => {
    const { name, slug, description, icon, color, isActive = true } = payload;

    const existing = await prisma.category.findFirst({
        where: {
            OR: [{ name }, { slug }],
        },
    });
    if (existing) {
        throw new AppError(status.CONFLICT, "Category name or slug already exists");
    }

    const category = await prisma.category.create({
        data: {
            name,
            slug,
            description: description ?? null,
            icon: icon ?? null,
            color: color ?? null,
            isActive,
        },
    });

    return category;
};

const updateCategory = async (id: string, payload: IUpdateCategoryPayload) => {
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) {
        throw new AppError(status.NOT_FOUND, "Category not found");
    }

    if (payload.name || payload.slug) {
        const whereItems: Array<Record<string, unknown>> = [];
        if (payload.name) whereItems.push({ name: payload.name });
        if (payload.slug) whereItems.push({ slug: payload.slug });

        const conflict = await prisma.category.findFirst({
            where: {
                AND: [{ id: { not: id } }],
                OR: whereItems,
            },
        });
        if (conflict) {
            throw new AppError(status.CONFLICT, "Category name or slug already exists");
        }
    }

    const updated = await prisma.category.update({
        where: { id },
        data: payload,
    });

    return updated;
};

const deleteCategory = async (id: string) => {
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) {
        throw new AppError(status.NOT_FOUND, "Category not found");
    }

    await prisma.category.delete({ where: { id } });
    return { message: "Category deleted successfully" };
};

export const CategoryService = {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
};
