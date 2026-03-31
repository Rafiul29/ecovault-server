import { Prisma } from "@/generated/prisma/client";

export const moderatorSearchableFields = ['name', 'user.email'];
export const moderatorFilterableFields = ['isActive', 'user.status'];

export const moderatorIncludeConfig: Prisma.ModeratorInclude = {
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