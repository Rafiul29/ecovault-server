import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { ICreateCategoryPayload, IUpdateCategoryPayload } from "./category.interface";

const normalizeSlug = (value: string) => {
    return value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "");
};

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

    const baseSlug = normalizeSlug(slug ?? name);

    const existing = await prisma.category.findFirst({
        where: {
            OR: [{ name }, { slug: baseSlug }],
        },
    });
    if (existing) {
        throw new AppError(status.CONFLICT, "Category name or slug already exists");
    }

    const category = await prisma.category.create({
        data: {
            name,
            slug: baseSlug,
            description: description ?? null,
            icon: icon ?? null,
            color: color ?? null,
            isActive,
        },
    });

    const updatedCategory = await prisma.category.update({
        where: { id: category.id },
        data: {
            slug: `${baseSlug}-${category.id}`,
        },
    });

    return updatedCategory;
};

const updateCategory = async (id: string, payload: IUpdateCategoryPayload) => {
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) {
        throw new AppError(status.NOT_FOUND, "Category not found");
    }

    let slugToUpdate: string | undefined;

    if (payload.name || payload.slug) {
        const whereItems: Array<Record<string, unknown>> = [];
        if (payload.name) whereItems.push({ name: payload.name });
        if (payload.slug) whereItems.push({ slug: normalizeSlug(payload.slug) });

        const conflict = await prisma.category.findFirst({
            where: {
                AND: [{ id: { not: id } }],
                OR: whereItems,
            },
        });
        if (conflict) {
            throw new AppError(status.CONFLICT, "Category name or slug already exists");
        }

        if (payload.slug) {
            slugToUpdate = `${normalizeSlug(payload.slug)}-${id}`;
        } else if (payload.name) {
            slugToUpdate = `${normalizeSlug(payload.name)}-${id}`;
        }
    }

    const updated = await prisma.category.update({
        where: { id },
        data: {
            ...payload,
            ...(slugToUpdate ? { slug: slugToUpdate } : {}),
        },
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
