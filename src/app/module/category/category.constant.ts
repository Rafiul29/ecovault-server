import { Prisma } from "../../../generated/prisma/client"

export const categorySearchableFields = [
    'id',
    'name',
    'slug',
    'description',
]

export const categoryFilterableFields = [
    'id',
    'name',
    'slug',
    'isActive',
    'createdAt',
    'updatedAt',
]

export const categoryIncludeConfig: Partial<Record<keyof Prisma.CategoryInclude, Prisma.CategoryInclude[keyof Prisma.CategoryInclude]>> = {
    ideas: true

}