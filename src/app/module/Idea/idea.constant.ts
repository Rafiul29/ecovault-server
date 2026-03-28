import { Prisma } from "../../../generated/prisma/client"

export const ideaSearchableFields = [
    'id',
    'title',
    'description',
    'problemStatement',
    'proposedSolution',
]

export const ideaFilterableFields = [
    'id',
    'authorId',
    'status',
    'isPaid',
    'price',
    'isFeatured',
    'categories.category.name',
    'tags.tag.name',
    'createdAt',
    'updatedAt',
]

export const ideaIncludeConfig: Partial<Record<keyof Prisma.IdeaInclude, Prisma.IdeaInclude[keyof Prisma.IdeaInclude]>> = {
    author: {
        select: {
            id: true,
            name: true,
            email: true,
        }
    },
    categories: {
        include: {
            category: true
        }
    },
    tags: {
        include: {
            tag: true
        }
    },
    attachments: true,
    _count: {
        select: {
            comments: true,
            votes: true,
            purchases: true,
            watchlists: true,
        }
    }
}