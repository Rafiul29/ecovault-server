import { Prisma } from "@/generated/prisma/client";

export const memberSearchableFields = ['name', 'email'];
export const memberFilterableFields = ['role', 'user.status', 'isDeleted'];

export const memberIncludeConfig: Prisma.UserInclude = {
    _count: {
        select: {
            ideas: true,
            purchasedIdeas: true,
            followers: true,
            following: true,
            reviewsPerformed: true,
        }
    }
};
