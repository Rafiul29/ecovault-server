import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { ICreateTagPayload, IUpdateTagPayload } from "./tag.interface";

const normalizeSlug = (value: string) => {
    return value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "");
};

const getAllTags = async () => {
    const tags = await prisma.tag.findMany({
        orderBy: { createdAt: "desc" },
    });
    return tags;
};

const getTagById = async (id: string) => {
    const tag = await prisma.tag.findUnique({
        where: { id },
    });

    if (!tag) {
        throw new AppError(status.NOT_FOUND, "Tag not found");
    }

    return tag;
};

const createTag = async (payload: ICreateTagPayload) => {
    const baseSlug = normalizeSlug(payload.slug ?? payload.name);

    const existing = await prisma.tag.findFirst({
        where: {
            OR: [{ name: payload.name }, { slug: baseSlug }],
        },
    });

    if (existing) {
        throw new AppError(status.CONFLICT, "Tag name or slug already exists");
    }

    const tag = await prisma.tag.create({
        data: {
            name: payload.name,
            slug: baseSlug,
        },
    });

    const updatedTag = await prisma.tag.update({
        where: { id: tag.id },
        data: { slug: `${baseSlug}-${tag.id}` },
    });

    return updatedTag;
};

const updateTag = async (id: string, payload: IUpdateTagPayload) => {
    const tag = await prisma.tag.findUnique({ where: { id } });
    if (!tag) {
        throw new AppError(status.NOT_FOUND, "Tag not found");
    }

    if (payload.name || payload.slug) {
        const orFilters: Array<Record<string, unknown>> = [];
        if (payload.name) orFilters.push({ name: payload.name });
        if (payload.slug) orFilters.push({ slug: normalizeSlug(payload.slug) });

        const conflict = await prisma.tag.findFirst({
            where: {
                AND: [{ id: { not: id } }],
                OR: orFilters,
            },
        });

        if (conflict) {
            throw new AppError(status.CONFLICT, "Tag name or slug already exists");
        }
    }

    const slugToUpdate = payload.slug ? `${normalizeSlug(payload.slug)}-${id}` : payload.name ? `${normalizeSlug(payload.name)}-${id}` : undefined;

    const updated = await prisma.tag.update({
        where: { id },
        data: {
            ...payload,
            ...(slugToUpdate ? { slug: slugToUpdate } : {}),
        },
    });

    return updated;
};

const deleteTag = async (id: string) => {
    const tag = await prisma.tag.findUnique({ where: { id } });
    if (!tag) {
        throw new AppError(status.NOT_FOUND, "Tag not found");
    }

    await prisma.tag.delete({ where: { id } });
    return { message: "Tag deleted successfully" };
};

export const TagService = {
    getAllTags,
    getTagById,
    createTag,
    updateTag,
    deleteTag,
};