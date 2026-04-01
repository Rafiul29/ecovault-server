export const subscriptionSearchableFields = [];
export const subscriptionFilterableFields = ["userId", "tier", "isActive", "subscriptionPlanId", "paymentId"];

export const subscriptionPlanSearchableFields = ["name", "description"];
export const subscriptionPlanFilterableFields = ["isActive", "isPopular", "tier"];

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
