import { IdeaStatus, PaymentStatus, Role } from "../../../generated/prisma/enums";
import AppError from "../../errorHelpers/AppError";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { prisma } from "../../lib/prisma";
import httpStatus from "http-status";

const getDashboardStatsData = async (user: IRequestUser) => {
    let statsData;

    switch (user.role) {
        case Role.SUPER_ADMIN:
        case Role.ADMIN:
            statsData = await getAdminStatsData();
            break;
        case Role.MODERATOR:
            statsData = await getModeratorStatsData(user);
            break;
        case Role.MEMBER:
            statsData = await getMemberStatsData(user);
            break;
        default:
            throw new AppError(httpStatus.BAD_REQUEST, "Invalid user role");
    }

    return statsData;
}

const getAdminStatsData = async () => {
    return await prisma.$transaction(async (tx) => {
        const totalUsers = await tx.user.count({ where: { isDeleted: false } });
        const totalIdeas = await tx.idea.count({ where: { isDeleted: false } });
        const totalCategories = await tx.category.count({ where: { isDeleted: false } });
        const totalTags = await tx.tag.count({ where: { isDeleted: false } });
        const totalPayments = await tx.payment.count();
        const totalSubscriptions = await tx.subscription.count({ where: { isActive: true } });

        const revenueResult = await tx.payment.aggregate({
            _sum: { amount: true },
            where: { status: PaymentStatus.COMPLETED }
        });

        // Independent chart queries can be part of the transaction or run alongside
        // For simplicity and to avoid raw query issues in transaction, we run them inside using the tx client if possible
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const statusGroups = await tx.idea.groupBy({
            by: ['status'],
            _count: { id: true },
            where: { isDeleted: false }
        });

        const barChartData: any[] = await tx.$queryRaw`
            SELECT 
                TO_CHAR(DATE_TRUNC('month', "createdAt"), 'Mon YYYY') AS month,
                CAST(COUNT(*) AS INTEGER) AS count
            FROM "idea"
            WHERE "createdAt" >= ${sixMonthsAgo} AND "isDeleted" = false
            GROUP BY DATE_TRUNC('month', "createdAt")
            ORDER BY DATE_TRUNC('month', "createdAt") ASC;
        `;

        return {
            totalUsers,
            totalIdeas,
            totalCategories,
            totalTags,
            totalPayments,
            totalSubscriptions,
            totalRevenue: revenueResult._sum.amount || 0,
            pieChartData: statusGroups.map(group => ({
                status: group.status,
                count: group._count.id
            })),
            barChartData
        };
    });
}

const getModeratorStatsData = async (user: IRequestUser) => {
    return await prisma.$transaction(async (tx) => {
        const totalReviewsHandled = await tx.ideaReview.count({
            where: { reviewerId: user.userId, isDeleted: false }
        });

        const pendingReviews = await tx.idea.count({
            where: { status: IdeaStatus.UNDER_REVIEW, isDeleted: false }
        });

        const totalSoldIdeas = await tx.ideaPurchase.count();

        const soldRevenueResult = await tx.ideaPurchase.aggregate({
            _sum: { amount: true }
        });

        const statusGroups = await tx.idea.groupBy({
            by: ['status'],
            _count: { id: true },
            where: { isDeleted: false }
        });

        return {
            totalReviewsHandled,
            pendingReviews,
            totalSoldIdeas,
            totalSoldPrices: soldRevenueResult._sum.amount || 0,
            ideaStatusDistribution: statusGroups.map(group => ({
                status: group.status,
                count: group._count.id
            }))
        };
    });
}

const getMemberStatsData = async (user: IRequestUser) => {
    return await prisma.$transaction(async (tx) => {
        const totalMyIdeas = await tx.idea.count({
            where: { authorId: user.userId, isDeleted: false }
        });

        const totalPurchasedIdeas = await tx.ideaPurchase.count({
            where: { userId: user.userId }
        });

        const spentResult = await tx.ideaPurchase.aggregate({
            _sum: { amount: true },
            where: { userId: user.userId }
        });

        const totalFollowers = await tx.follow.count({
            where: { followingId: user.userId }
        });

        const totalFollowing = await tx.follow.count({
            where: { followerId: user.userId }
        });

        const watchlistCount = await tx.watchlist.count({
            where: { userId: user.userId, isDeleted: false }
        });

        return {
            totalMyIdeas,
            totalPurchasedIdeas,
            totalSpent: spentResult._sum.amount || 0,
            totalFollowers,
            totalFollowing,
            watchlistCount
        };
    });
}

export const StatsService = {
    getDashboardStatsData
}
