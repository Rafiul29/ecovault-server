import httpStatus from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { ICreateIdeaPayload, IUpdateIdeaPayload } from "./idea.interface";
import { normalizeSlug } from "../../utils/slug";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { ideaFilterableFields, ideaIncludeConfig, ideaSearchableFields } from "./idea.constant";
import { IQueryParams } from "../../interfaces/query.interface";
import { deleteFileFromCloudinary } from "@/app/config/cloudinary.config";

const getAllIdeas = async (queryParams: IQueryParams) => {
    const ideaQuery = new QueryBuilder(prisma.idea, queryParams, {
        searchableFields: ideaSearchableFields,
        filterableFields: ideaFilterableFields,
    })
        .search()
        .filter()
        .paginate()
        .sort()
        .dynamicInclude(ideaIncludeConfig, Object.keys(ideaIncludeConfig));

    return await ideaQuery.execute();
};

const getMyIdeas = async (authorId: string, queryParams: IQueryParams) => {
    const ideaQuery = new QueryBuilder(prisma.idea, queryParams, {
        searchableFields: ideaSearchableFields,
        filterableFields: ideaFilterableFields,
    })
        .where({ authorId, isDeleted: false })
        .search()
        .filter()
        .paginate()
        .sort()
        .dynamicInclude(ideaIncludeConfig, Object.keys(ideaIncludeConfig));

    return await ideaQuery.execute();
};

const getIdeaById = async (id: string, includeDeleted = false) => {
    // Increment view count when fetching a single idea
    await prisma.idea.update({
        where: { id },
        data: {
            viewCount: { increment: 1 },
        },
    });

    const idea = await prisma.idea.findUnique({
        where: { id },
        include: {
            categories: {
                include: {
                    category: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                            icon: true,
                            color: true,
                        }
                    }
                }
            },
            tags: {
                include: {
                    tag: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                        }
                    }
                }
            },
            author: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                    _count: {
                        select: {
                            followers: true,
                            following: true,
                        },
                    },
                },
            },
            comments: true,
            votes: true,
            attachments: true,
            _count: {
                select: {
                    comments: true,
                    votes: true,
                    purchases: true,
                    watchlists: true,
                }
            }
        },
    });

    if (!idea || (!includeDeleted && idea.isDeleted)) {
        throw new AppError(httpStatus.NOT_FOUND, "Idea not found");
    }

    return idea;
};

const createIdea = async (payload: ICreateIdeaPayload, authorId: string) => {
    const { title, slug, description, problemStatement, proposedSolution, images, categories, tags, status, isPaid, price, isFeatured } = payload;

    const baseSlug = normalizeSlug(slug ?? title);

    const existing = await prisma.idea.findFirst({
        where: { slug: baseSlug },
    });
    if (existing) {
        throw new AppError(httpStatus.CONFLICT, "Idea slug already exists");
    }

    // Validate categories exist
    if (categories && categories.length > 0) {
        const categoryCount = await prisma.category.count({
            where: { id: { in: categories } },
        });
        if (categoryCount !== categories.length) {
            throw new AppError(httpStatus.BAD_REQUEST, "One or more category IDs are invalid");
        }
    }

    // Validate tags exist
    if (tags && tags.length > 0) {
        const tagCount = await prisma.tag.count({
            where: { id: { in: tags } },
        });
        if (tagCount !== tags.length) {
            throw new AppError(httpStatus.BAD_REQUEST, "One or more tag IDs are invalid");
        }
    }

    const result = await prisma.$transaction(async (tx) => {
        // 1. Create the idea
        const idea = await tx.idea.create({
            data: {
                title,
                slug: baseSlug, // Temporary slug
                description,
                problemStatement,
                proposedSolution,
                images: images ?? [],
                authorId: authorId,
                status: (status ?? "DRAFT") as any,
                isPaid: isPaid ?? false,
                price: price ?? 0,
                isFeatured: isFeatured ?? false,
            },
        });

        // 2. Update with final unique slug (slug + idea.id)
        const finalSlug = `${baseSlug}-${idea.id}`;
        const updatedIdea = await tx.idea.update({
            where: { id: idea.id },
            data: { slug: finalSlug },
        });

        // 3. Create category relations
        if (categories && categories.length > 0) {
            await tx.ideaCategory.createMany({
                data: categories.map(categoryId => ({
                    ideaId: idea.id,
                    categoryId,
                })),
            });
        }

        // 4. Create tag relations
        if (tags && tags.length > 0) {
            await tx.ideaTag.createMany({
                data: tags.map(tagId => ({
                    ideaId: idea.id,
                    tagId,
                })),
            });
        }

        return updatedIdea;
    });

    return await getIdeaById(result.id);
};

const updateIdea = async (id: string, payload: IUpdateIdeaPayload, authorId: string) => {
    const idea = await prisma.idea.findUnique({ where: { id } });
    if (!idea) {
        throw new AppError(httpStatus.NOT_FOUND, "Idea not found");
    }

    if (idea.authorId !== authorId) {
        throw new AppError(httpStatus.FORBIDDEN, "You can only update your own ideas");
    }

    const { title, slug, description, problemStatement, proposedSolution, images, categories, tags, status, isPaid, price, isFeatured } = payload;

    // Validate categories exist if provided
    if (categories && categories.length > 0) {
        const categoryCount = await prisma.category.count({
            where: { id: { in: categories } },
        });
        if (categoryCount !== categories.length) {
            throw new AppError(httpStatus.BAD_REQUEST, "One or more category IDs are invalid");
        }
    }

    // Validate tags exist if provided
    if (tags && tags.length > 0) {
        const tagCount = await prisma.tag.count({
            where: { id: { in: tags } },
        });
        if (tagCount !== tags.length) {
            throw new AppError(httpStatus.BAD_REQUEST, "One or more tag IDs are invalid");
        }
    }

    let finalSlug: string | undefined;
    if (slug || title) {
        const baseSlug = normalizeSlug(slug ?? title!);
        finalSlug = `${baseSlug}-${id}`;

        const existing = await prisma.idea.findFirst({
            where: { slug: finalSlug, id: { not: id } },
        });
        if (existing) {
            throw new AppError(httpStatus.CONFLICT, "Idea slug already exists");
        }
    }

    const updateData: any = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (problemStatement) updateData.problemStatement = problemStatement;
    if (proposedSolution) updateData.proposedSolution = proposedSolution;

    // Manage images update
    if (images !== undefined) {
        const currentImages = idea.images || [];
        const removedImages = currentImages.filter(img => !images.includes(img));

        // Remove images from Cloudinary if specifically replaced
        if (removedImages.length > 0) {
            await Promise.all(removedImages.map(url => deleteFileFromCloudinary(url)));
        }
        updateData.images = images;
    }

    if (status) updateData.status = status as any;
    if (isPaid !== undefined) updateData.isPaid = isPaid;
    if (price !== undefined) updateData.price = price;
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured;

    if (finalSlug) updateData.slug = finalSlug;

    await prisma.$transaction(async (tx) => {
        // 1. Update main record
        await tx.idea.update({
            where: { id },
            data: updateData,
        });

        // 2. Update category relations
        if (categories !== undefined) {
            await tx.ideaCategory.deleteMany({
                where: { ideaId: id },
            });

            if (categories.length > 0) {
                await tx.ideaCategory.createMany({
                    data: categories.map(categoryId => ({
                        ideaId: id,
                        categoryId,
                    })),
                });
            }
        }

        // 3. Update tag relations
        if (tags !== undefined) {
            await tx.ideaTag.deleteMany({
                where: { ideaId: id },
            });

            if (tags.length > 0) {
                await tx.ideaTag.createMany({
                    data: tags.map(tagId => ({
                        ideaId: id,
                        tagId,
                    })),
                });
            }
        }
    });

    return await getIdeaById(id);
};

const deleteIdea = async (id: string, authorId: string) => {
    const idea = await prisma.idea.findUnique({ where: { id } });
    if (!idea) {
        throw new AppError(httpStatus.NOT_FOUND, "Idea not found");
    }

    if (authorId !== "SUPER_ADMIN_BYPASS" && idea.authorId !== authorId) {
        throw new AppError(httpStatus.FORBIDDEN, "You can only delete your own ideas");
    }

    // Soft delete idea
    await prisma.idea.update({
        where: { id },
        data: {
            isDeleted: true,
            deletedAt: new Date(),
        },
    });

    return { message: "Idea soft deleted successfully" };
};

const deleteIdeaPermanently = async (id: string) => {
    const idea = await prisma.idea.findUnique({ where: { id } });
    if (!idea) {
        throw new AppError(httpStatus.NOT_FOUND, "Idea not found");
    }

    // Delete associated images from Cloudinary permanently
    if (idea.images && idea.images.length > 0) {
        await Promise.all(idea.images.map(url => deleteFileFromCloudinary(url)));
    }

    // Execute permanent deletion from database
    await prisma.idea.delete({ where: { id } });

    return { message: "Idea permanently deleted from system" };
};

export const IdeaService = {
    getAllIdeas,
    getMyIdeas,
    getIdeaById,
    createIdea,
    updateIdea,
    deleteIdea,
    deleteIdeaPermanently,
};