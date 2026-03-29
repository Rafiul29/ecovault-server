import httpStatus from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { ICreateTagPayload, IUpdateTagPayload } from "./tag.interface";
import { normalizeSlug } from "../../utils/slug";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { Tag } from "../../../generated/prisma/client";
import { tagFilterableFields, tagIncludeConfig, tagSearchableFields } from "./tag.constant";
import { IQueryParams } from "../../interfaces/query.interface";

const getAllTags = async (query: IQueryParams) => {
    const tagQuery = new QueryBuilder<Tag>(
        prisma.tag,
        query,
        {
            searchableFields: tagSearchableFields,
            filterableFields: tagFilterableFields,
        }
    )
        .search()
        .filter()
        .paginate()
        .sort()
        .fields()
        .dynamicInclude(tagIncludeConfig);

    const result = await tagQuery.execute();
    return result;
};

const getTagById = async (id: string) => {
    const tag = await prisma.tag.findUnique({
        where: { id },
    });

    if (!tag) {
        throw new AppError(httpStatus.NOT_FOUND, "Tag not found");
    }

    return tag;
};

const createTag = async (payload: ICreateTagPayload) => {
    const { name, slug } = payload;

    const baseSlug = normalizeSlug(slug ?? name);

    // Check for existing tag with same name or slug
    const existing = await prisma.tag.findFirst({
        where: {
            OR: [
                { name },
                { slug: baseSlug }
            ],
        },
    });

    if (existing) {
        if (existing.name === name) {
            throw new AppError(httpStatus.CONFLICT, "Tag name already exists");
        } else {
            throw new AppError(httpStatus.CONFLICT, "Tag slug already exists");
        }
    }

    // Create tag with base slug first
    const tag = await prisma.tag.create({
        data: {
            name,
            slug: baseSlug,
        },
    });

    // Update slug with ID appended
    const finalSlug = `${baseSlug}-${tag.id}`;
    const updatedTag = await prisma.tag.update({
        where: { id: tag.id },
        data: { slug: finalSlug },
    });

    return updatedTag;
};

const updateTag = async (id: string, payload: IUpdateTagPayload) => {
    const tag = await prisma.tag.findUnique({ where: { id } });
    if (!tag) {
        throw new AppError(httpStatus.NOT_FOUND, "Tag not found");
    }

    const { name, slug } = payload;

    // Validate uniqueness if name or slug is being updated
    if (name || slug) {
        const orConditions: Array<Record<string, any>> = [];
        if (name) orConditions.push({ name });
        if (slug) orConditions.push({ slug: normalizeSlug(slug) });

        const existing = await prisma.tag.findFirst({
            where: {
                AND: [
                    { id: { not: id } },
                    { OR: orConditions }
                ],
            },
        });

        if (existing) {
            if (name && existing.name === name) {
                throw new AppError(httpStatus.CONFLICT, "Tag name already exists");
            } else {
                throw new AppError(httpStatus.CONFLICT, "Tag slug already exists");
            }
        }
    }

    // Prepare update data
    const updateData: any = {};
    if (name) updateData.name = name;

    // Handle slug update separately for consistency
    let finalSlug: string | undefined;
    if (slug || name) {
        const baseSlug = normalizeSlug(slug ?? name!);
        finalSlug = `${baseSlug}-${id}`;
    }

    // Update main tag data (excluding slug)
    await prisma.tag.update({
        where: { id },
        data: updateData,
    });

    // Update slug separately if needed
    if (finalSlug) {
        await prisma.tag.update({
            where: { id },
            data: { slug: finalSlug },
        });
    }

    // Return updated tag
    return await getTagById(id);
};

const deleteTag = async (id: string) => {
    const tag = await prisma.tag.findUnique({ where: { id } });
    if (!tag) {
        throw new AppError(httpStatus.NOT_FOUND, "Tag not found");
    }

    // Soft delete
    await prisma.tag.update({
        where: { id },
        data: {
            isDeleted: true,
            deletedAt: new Date(),
        },
    });
    
    return { message: "Tag soft deleted successfully" };
};

const deleteTagPermanently = async (id: string) => {
    const tag = await prisma.tag.findUnique({ where: { id } });
    if (!tag) {
        throw new AppError(httpStatus.NOT_FOUND, "Tag not found");
    }

    // Check if tag is being used
    const ideaTagCount = await prisma.ideaTag.count({
        where: { tagId: id },
    });

    if (ideaTagCount > 0) {
        throw new AppError(httpStatus.BAD_REQUEST, "Cannot permanently delete tag associated with ideas");
    }

    await prisma.tag.delete({ where: { id } });
    return { message: "Tag permanently deleted from system" };
};

export const TagService = {
    getAllTags,
    getTagById,
    createTag,
    updateTag,
    deleteTag,
    deleteTagPermanently,
};