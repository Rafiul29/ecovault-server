import httpStatus from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { memberIncludeConfig } from "./member.constant";

const getMyProfile = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId, isDeleted: false },
        include: memberIncludeConfig
    });

    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User profile not found");
    }

    return user;
};

const getMyPurchasedIdeas = async (userId: string) => {
    return await prisma.ideaPurchase.findMany({
        where: { userId },
        include: {
            idea: {
                include: {
                    categories: { 
                        include: { 
                            category: {
                                select: {
                                    id: true,
                                    name: true,
                                    slug: true,
                                    icon: true,
                                    color: true
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
                                    slug: true
                                }
                            } 
                        } 
                    },
                    author: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            image: true
                        }
                    }
                }
            },
            // Payment info acts as invoice
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            }
        },
        orderBy: { purchasedAt: 'desc' }
    });
};

const getMyFollowers = async (userId: string) => {
    return await prisma.follow.findMany({
        where: { followingId: userId },
        include: {
            follower: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                    role: true
                }
            }
        }
    });
};

const getMyFollowing = async (userId: string) => {
    return await prisma.follow.findMany({
        where: { followerId: userId },
        include: {
            following: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                    role: true
                }
            }
        }
    });
};

const getMyReviews = async (userId: string) => {
    return await prisma.ideaReview.findMany({
        where: { reviewerId: userId },
        include: {
            idea: {
                select: {
                    id: true,
                    title: true,
                    slug: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });
};

const getInvoice = async (paymentId: string, userId: string) => {
    const payment = await prisma.payment.findUnique({
        where: { id: paymentId, userId },
        include: {
            user: {
                select: {
                    name: true,
                    email: true,
                }
            }
        }
    });

    if (!payment) {
        throw new AppError(httpStatus.NOT_FOUND, "Invoice not found");
    }

    return payment;
};

export const MemberService = {
    getMyProfile,
    getMyPurchasedIdeas,
    getMyFollowers,
    getMyFollowing,
    getMyReviews,
    getInvoice
};
