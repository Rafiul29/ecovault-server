import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { SubscriptionService } from "./subscription.service";

const createSubscriptionPlan = catchAsync(async (req: Request, res: Response) => {
    const result = await SubscriptionService.createSubscriptionPlan(req.body);

    sendResponse(res, {
        httpStatusCode: status.CREATED,
        success: true,
        message: "Subscription plan created successfully",
        data: result
    });
});

const getAllSubscriptionPlans = catchAsync(async (req: Request, res: Response) => {
    const result = await SubscriptionService.getAllSubscriptionPlans();

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Subscription plans retrieved successfully",
        data: result
    });
});

const getSubscriptionPlanById = catchAsync(async (req: Request, res: Response) => {
    const result = await SubscriptionService.getSubscriptionPlanById(req.params.id as string);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Subscription plan retrieved successfully",
        data: result
    });
});

const updateSubscriptionPlan = catchAsync(async (req: Request, res: Response) => {
    const result = await SubscriptionService.updateSubscriptionPlan(req.params.id as string, req.body);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Subscription plan updated successfully",
        data: result
    });
});

const subscribeToPlan = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user.userId;
    const { subscriptionPlanId, paymentMethod } = req.body;
    const method = paymentMethod || 'STRIPE';

    let result;
    if (method === 'BKASH') {
        result = await SubscriptionService.subscribeViaBkash(userId, subscriptionPlanId);
    } else if (method === 'SSLECOMMERCE') {
        result = await SubscriptionService.subscribeViaSsl(userId, subscriptionPlanId);
    } else if (method === 'NAGAD') {
        result = await SubscriptionService.subscribeViaNagad(userId, subscriptionPlanId);
    } else if (method === 'CARD') {
        result = await SubscriptionService.subscribeViaCard(userId, subscriptionPlanId);
    } else {
        result = await SubscriptionService.subscribeViaStripe(userId, subscriptionPlanId);
    }

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Subscription initialized successfully",
        data: result
    });
});

const getMySubscription = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user.userId;
    const result = await SubscriptionService.getMySubscription(userId);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "My subscription retrieved successfully",
        data: result
    });
});

const getAllSubscriptions = catchAsync(async (req: Request, res: Response) => {
    const queryParams = req.query;
    const result = await SubscriptionService.getAllSubscriptionsFromDb(queryParams);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "All subscriptions retrieved successfully",
        data: result
    });
});

export const SubscriptionController = {
    createSubscriptionPlan,
    getAllSubscriptionPlans,
    getSubscriptionPlanById,
    updateSubscriptionPlan,
    subscribeToPlan,
    getMySubscription,
    getAllSubscriptions
};
