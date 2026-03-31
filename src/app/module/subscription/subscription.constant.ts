export const subscriptionSearchableFields = [];

export const subscriptionFilterableFields = [
    "userId",
    "tier",
    "isActive",
    "subscriptionPlanId",
    "paymentId",
];

export const subscriptionIncludeConfig = {
    user: {
        select: {
            id: true,
            name: true,
            email: true,
            image: true,
        },
    },
    subscriptionPlan: true,
    payment: true,
};
