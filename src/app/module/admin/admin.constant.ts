import { Prisma } from "../../../generated/prisma/client";

export const adminSearchableFields = ['name', 'email'];
export const adminFilterableFields = ['user.status', 'isDeleted'];

export const adminIncludeConfig: Prisma.AdminInclude = {
    user: {
        select: {
            id: true,
            email: true,
            status: true,
            role: true,
            createdAt: true,
            updatedAt: true,
             _count: {
                select: {
                    ideas: true,
                    purchasedIdeas: true,
                    followers: true,
                    following: true,
                    reviewsPerformed: true,
                }
            }
        }
    }
};
