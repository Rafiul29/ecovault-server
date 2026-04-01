import { Prisma } from "../../../generated/prisma/client"

export const ideaSearchableFields = [
    'id',
    'title',
    'description',
    'problemStatement',
    'proposedSolution',
    'author.name',
    'categories.category.name',
    'tags.tag.name',
]

export const ideaFilterableFields = [
    'id',
    'authorId',
    'status',
    'isPaid',
    'price',
    'isFeatured',
    'categories.category.name',
    'categories.category.id',
    'categories.category.slug',
    'tags.tag.name',
    'tags.tag.id',
    'tags.tag.slug',
    'createdAt',
    'updatedAt',
    'isDeleted',
    'viewCount',
    'upvoteCount',
    'downvoteCount',
    'trendingScore',
]

export const ideaIncludeConfig: Partial<Record<keyof Prisma.IdeaInclude, Prisma.IdeaInclude[keyof Prisma.IdeaInclude]>> = {
    author: {
        select: {
            id: true,
            name: true,
            email: true,
            image: true,
        }
    },
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