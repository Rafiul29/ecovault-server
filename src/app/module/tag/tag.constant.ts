import { Prisma } from "../../../generated/prisma/client"

export const tagSearchableFields = [
    'id',
    'name',
    'slug'
]

export const tagFilterableFields = [
    'id',
    'name',
    'slug',
]

export const tagIncludeConfig: Partial<Record<keyof Prisma.TagInclude, Prisma.TagInclude[keyof Prisma.TagInclude]>> = {
    ideas: true
}