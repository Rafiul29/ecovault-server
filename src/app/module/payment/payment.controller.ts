
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import status from "http-status";
import { envVars } from "../../config/env";
import { stripe } from "../../config/stripe.config";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { PaymentService } from "./payment.service";

const handleStripeWebhookEvent = catchAsync(async (req: Request, res: Response) => {
    const signature = req.headers['stripe-signature'] as string
    const webhookSecret = envVars.STRIPE.STRIPE_WEBHOOK_SECRET;

    if (!signature || !webhookSecret) {
        console.error("Missing Stripe signature or webhook secret");
        return res.status(status.BAD_REQUEST).json({ message: "Missing Stripe signature or webhook secret" })
    }

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
    } catch (error: any) {
        console.error("Error processing Stripe webhook:", error);
        return res.status(status.BAD_REQUEST).json({ message: "Error processing Stripe webhook" })
    }

    try {
        const result = await PaymentService.handlerStripeWebhookEvent(event);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Stripe webhook event processed successfully",
            data: result
        })
    } catch (error) {
        console.error("Error handling Stripe webhook event:", error);
        sendResponse(res, {
            httpStatusCode: status.INTERNAL_SERVER_ERROR,
            success: false,
            message: "Error handling Stripe webhook event"
        })
    }
})

const handleBkashWebhookEvent = catchAsync(async (req: Request, res: Response) => {
    sendResponse(res, { httpStatusCode: status.OK, success: true, message: "bKash webhook received" });
});

const handleSslWebhookEvent = catchAsync(async (req: Request, res: Response) => {
    sendResponse(res, { httpStatusCode: status.OK, success: true, message: "SSLCommerce webhook received" });
});

const handleNagadWebhookEvent = catchAsync(async (req: Request, res: Response) => {
    sendResponse(res, { httpStatusCode: status.OK, success: true, message: "Nagad webhook received" });
});

const handleCardWebhookEvent = catchAsync(async (req: Request, res: Response) => {
    sendResponse(res, { httpStatusCode: status.OK, success: true, message: "Card webhook received" });
});

const createCheckoutSession = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user.userId;
    const { ideaId, paymentMethod } = req.body;
    const method = paymentMethod || 'STRIPE';

    let result;
    if (method === 'BKASH') {
        result = await PaymentService.createBkashSession(userId, ideaId);
    } else if (method === 'SSLECOMMERCE') {
        result = await PaymentService.createSslSession(userId, ideaId);
    } else if (method === 'NAGAD') {
        result = await PaymentService.createNagadSession(userId, ideaId);
    } else if (method === 'CARD') {
        result = await PaymentService.createCardSession(userId, ideaId);
    } else {
        result = await PaymentService.createStripeSession(userId, ideaId);
    }
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Checkout session created successfully",
        data: result
    });
});

const getMyPurchases = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user.userId;
    const result = await PaymentService.getMyPurchases(userId);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "My purchases retrieved successfully",
        data: result
    });
});

const getAllPurchases = catchAsync(async (req: Request, res: Response) => {
    const result = await PaymentService.getAllPurchases();

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "All purchases retrieved successfully",
        data: result
    });
});

export const PaymentController = {
    handleStripeWebhookEvent,
    handleBkashWebhookEvent,
    handleSslWebhookEvent,
    handleNagadWebhookEvent,
    handleCardWebhookEvent,
    createCheckoutSession,
    getMyPurchases,
    getAllPurchases
}