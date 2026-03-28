import httpStatus from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { ICreateCategoryPayload, IUpdateCategoryPayload } from "./category.interface";
import { normalizeSlug } from "../../utils/slug";

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
        throw new AppError(httpStatus.NOT_FOUND, "Category not found");
    }

    return category;
};

const createCategory = async (payload: ICreateCategoryPayload) => {
    const { name, slug, description, icon, color, isActive = true } = payload;

    const baseSlug = normalizeSlug(slug ?? name);

    // Check for existing category with same name or slug
    const existing = await prisma.category.findFirst({
        where: {
            OR: [
                { name },
                { slug: baseSlug }
            ],
        },
    });

    if (existing) {
        if (existing.name === name) {
            throw new AppError(httpStatus.CONFLICT, "Category name already exists");
        } else {
            throw new AppError(httpStatus.CONFLICT, "Category slug already exists");
        }
    }

    // Create category with base slug first
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

    // Update slug with ID appended
    const finalSlug = `${baseSlug}-${category.id}`;
    const updatedCategory = await prisma.category.update({
        where: { id: category.id },
        data: { slug: finalSlug },
    });

    return updatedCategory;
};

const updateCategory = async (id: string, payload: IUpdateCategoryPayload) => {
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) {
        throw new AppError(httpStatus.NOT_FOUND, "Category not found");
    }

    const { name, slug, description, icon, color, isActive } = payload;

    // Validate uniqueness if name or slug is being updated
    if (name || slug) {
        const orConditions: Array<Record<string, any>> = [];
        if (name) orConditions.push({ name });
        if (slug) orConditions.push({ slug: normalizeSlug(slug) });

        const existing = await prisma.category.findFirst({
            where: {
                AND: [
                    { id: { not: id } },
                    { OR: orConditions }
                ],
            },
        });

        if (existing) {
            if (name && existing.name === name) {
                throw new AppError(httpStatus.CONFLICT, "Category name already exists");
            } else {
                throw new AppError(httpStatus.CONFLICT, "Category slug already exists");
            }
        }
    }

    // Prepare update data
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (icon !== undefined) updateData.icon = icon;
    if (color !== undefined) updateData.color = color;
    if (isActive !== undefined) updateData.isActive = isActive;

    // Handle slug update separately for consistency
    let finalSlug: string | undefined;
    if (slug || name) {
        const baseSlug = normalizeSlug(slug ?? name!);
        finalSlug = `${baseSlug}-${id}`;
    }

    // Update main category data (excluding slug)
    await prisma.category.update({
        where: { id },
        data: updateData,
    });

    // Update slug separately if needed
    if (finalSlug) {
        await prisma.category.update({
            where: { id },
            data: { slug: finalSlug },
        });
    }

    // Return updated category
    return await getCategoryById(id);
};

const deleteCategory = async (id: string) => {
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) {
        throw new AppError(httpStatus.NOT_FOUND, "Category not found");
    }

    // Check if category is being used in any ideas
    const ideaCategoryCount = await prisma.ideaCategory.count({
        where: { categoryId: id },
    });

    if (ideaCategoryCount > 0) {
        throw new AppError(httpStatus.BAD_REQUEST, "Cannot delete category that is associated with existing ideas");
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
