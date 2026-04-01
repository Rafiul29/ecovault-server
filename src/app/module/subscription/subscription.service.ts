import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelpers/AppError";
import status from "http-status";
import { stripe } from "../../config/stripe.config";
import { PaymentStatus, SubscriptionTier } from "../../../generated/prisma/enums";
import { envVars } from "../../config/env";
import { QueryBuilder } from "../../utils/QueryBuilder";
import {
    subscriptionFilterableFields,
    subscriptionIncludeConfig,
    subscriptionSearchableFields,
    subscriptionPlanFilterableFields,
    subscriptionPlanSearchableFields,
} from "./subscription.constant";
import { IQueryParams } from "../../interfaces/query.interface";

// Plan Services
const createSubscriptionPlan = async (payload: any) => {
    return await prisma.subscriptionPlan.create({
        data: payload
    });
};

const getAllSubscriptionPlans = async (queryParams: IQueryParams) => {
    const modifiedQueryParams: IQueryParams = {
        sortBy: "order",
        sortOrder: "asc",
        ...queryParams
    };

    const subscriptionPlanQuery = new QueryBuilder(prisma.subscriptionPlan, modifiedQueryParams, {
        searchableFields: subscriptionPlanSearchableFields,
        filterableFields: subscriptionPlanFilterableFields,
    })
        .search()
        .filter()
        .paginate()
        .sort();

    return await subscriptionPlanQuery.execute();
};

const getSubscriptionPlanById = async (id: string) => {
    return await prisma.subscriptionPlan.findUniqueOrThrow({
        where: { id }
    });
};

const updateSubscriptionPlan = async (id: string, payload: any) => {
    return await prisma.subscriptionPlan.update({
        where: { id },
        data: payload
    });
};

const deleteSubscriptionPlan = async (id: string) => {
    return await prisma.subscriptionPlan.delete({
        where: { id }
    });
};

// User Subscription Services
const prepareSubscription = async (userId: string, subscriptionPlanId: string) => {
    const plan = await prisma.subscriptionPlan.findUnique({
        where: { id: subscriptionPlanId }
    });

    if (!plan) {
        throw new AppError(status.NOT_FOUND, "Subscription plan not found");
    }

    if (!plan.isActive) {
        throw new AppError(status.BAD_REQUEST, "This subscription plan is not currently active");
    }

    if (plan.price === 0) {
        const result = await prisma.subscription.upsert({
            where: { userId },
            update: {
                tier: plan.tier,
                subscriptionPlanId: plan.id,
                startDate: new Date(),
                endDate: new Date(Date.now() + plan.durationDays * 24 * 60 * 60 * 1000),
                isActive: true
            },
            create: {
                userId,
                tier: plan.tier,
                subscriptionPlanId: plan.id,
                startDate: new Date(),
                endDate: new Date(Date.now() + plan.durationDays * 24 * 60 * 60 * 1000),
                isActive: true
            }
        });
        return { isFree: true, message: "Successfully subscribed to free plan", subscription: result };
    }

    const payment = await prisma.payment.create({
        data: {
            amount: plan.price,
            status: PaymentStatus.PENDING,
            userId: userId,
        }
    });

    return { isFree: false, plan, payment };
};

const subscribeViaStripe = async (userId: string, subscriptionPlanId: string) => {
    const prepared = await prepareSubscription(userId, subscriptionPlanId);

    if (prepared.isFree) {
        return { message: prepared.message, subscription: prepared.subscription };
    }

    const { plan, payment } = prepared;

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
            {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: `Subscription: ${plan!.name}`,
                        description: plan!.description || `Upgrade to ${plan!.name}`,
                    },
                    unit_amount: Math.round(plan!.price * 100),
                },
                quantity: 1,
            },
        ],
        mode: 'payment',
        success_url: `${envVars.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${envVars.FRONTEND_URL}/cancel`,
        metadata: {
            paymentId: payment!.id,
            subscriptionPlanId: plan!.id,
            userId: userId,
            isSubscriptionCheck: "true"
        }
    });

    return { url: session.url };
};

const subscribeViaBkash = async (userId: string, subscriptionPlanId: string) => {
    const prepared = await prepareSubscription(userId, subscriptionPlanId);
    if (prepared.isFree) return { message: prepared.message, subscription: prepared.subscription };
    return { url: `${envVars.FRONTEND_URL}/bkash-processing?payment_id=${prepared.payment!.id}` };
};

const subscribeViaSsl = async (userId: string, subscriptionPlanId: string) => {
    const prepared = await prepareSubscription(userId, subscriptionPlanId);
    if (prepared.isFree) return { message: prepared.message, subscription: prepared.subscription };
    return { url: `${envVars.FRONTEND_URL}/sslcommerce-processing?payment_id=${prepared.payment!.id}` };
};

const subscribeViaNagad = async (userId: string, subscriptionPlanId: string) => {
    const prepared = await prepareSubscription(userId, subscriptionPlanId);
    if (prepared.isFree) return { message: prepared.message, subscription: prepared.subscription };
    return { url: `${envVars.FRONTEND_URL}/nagad-processing?payment_id=${prepared.payment!.id}` };
};

const subscribeViaCard = async (userId: string, subscriptionPlanId: string) => {
    const prepared = await prepareSubscription(userId, subscriptionPlanId);
    if (prepared.isFree) return { message: prepared.message, subscription: prepared.subscription };
    return { url: `${envVars.FRONTEND_URL}/card-processing?payment_id=${prepared.payment!.id}` };
};

const getMySubscription = async (userId: string) => {
    return prisma.subscription.findMany({
        where: { userId },
        include: {
            subscriptionPlan: true,
            payment: true
        },
        orderBy: {
            createdAt: "desc"
        }
    });
};

const getAllSubscriptionsFromDb = async (queryParams: IQueryParams) => {
    const subscriptionQuery = new QueryBuilder(prisma.subscription, queryParams, {
        searchableFields: subscriptionSearchableFields,
        filterableFields: subscriptionFilterableFields,
    })
        .search()
        .filter()
        .paginate()
        .sort()
        .dynamicInclude(subscriptionIncludeConfig, Object.keys(subscriptionIncludeConfig));

    return await subscriptionQuery.execute();
};

export const SubscriptionService = {
    createSubscriptionPlan,
    getAllSubscriptionPlans,
    getSubscriptionPlanById,
    updateSubscriptionPlan,
    deleteSubscriptionPlan,
    subscribeViaStripe,
    subscribeViaBkash,
    subscribeViaSsl,
    subscribeViaNagad,
    subscribeViaCard,
    getMySubscription,
    getAllSubscriptionsFromDb
};
