import { Request, Response } from "express";
import httpStatus from "http-status";
import { MemberService } from "./member.service";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";

const getMyProfile = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const result = await MemberService.getMyProfile(userId);
    sendResponse(res, {
        httpStatusCode: httpStatus.OK,
        success: true,
        message: "Profile retrieved successfully",
        data: result,
    });
});

const getMyPurchasedIdeas = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const result = await MemberService.getMyPurchasedIdeas(userId);
    sendResponse(res, {
        httpStatusCode: httpStatus.OK,
        success: true,
        message: "Purchased ideas retrieved successfully",
        data: result,
    });
});

const getMyFollowers = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const result = await MemberService.getMyFollowers(userId);
    sendResponse(res, {
        httpStatusCode: httpStatus.OK,
        success: true,
        message: "Followers retrieved successfully",
        data: result,
    });
});

const getMyFollowing = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const result = await MemberService.getMyFollowing(userId);
    sendResponse(res, {
        httpStatusCode: httpStatus.OK,
        success: true,
        message: "Following users retrieved successfully",
        data: result,
    });
});

const getMyReviews = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const result = await MemberService.getMyReviews(userId);
    sendResponse(res, {
        httpStatusCode: httpStatus.OK,
        success: true,
        message: "Reviews retrieved successfully",
        data: result,
    });
});

const getInvoice = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const paymentId = String(req.params.paymentId);
    const result = await MemberService.getInvoice(paymentId, userId);
    sendResponse(res, {
        httpStatusCode: httpStatus.OK,
        success: true,
        message: "Invoice retrieved successfully",
        data: result,
    });
});

const getAllMembers = catchAsync(async (req: Request, res: Response) => {
    const result = await MemberService.getAllMembers(req.query as any);
    sendResponse(res, {
        httpStatusCode: httpStatus.OK,
        success: true,
        message: "Members retrieved successfully",
        data: result.data,
        meta: result.meta,
    });
});

export const MemberController = {
    getMyProfile,
    getMyPurchasedIdeas,
    getMyFollowers,
    getMyFollowing,
    getMyReviews,
    getInvoice,
    getAllMembers
};
