import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { ModeratorService } from "./moderator.service";
import AppError from "../../errorHelpers/AppError";

const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const profile = await ModeratorService.getMyProfile(userId);
  if (!profile) {
    throw new AppError(httpStatus.NOT_FOUND, "Moderator profile not found");
  }
  sendResponse(res, {
    httpStatusCode: httpStatus.OK,
    success: true,
    message: "Moderator profile retrieved successfully",
    data: profile,
  });
});

const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const payload = {
    ...req.body,
  }
  if (req.file) {
    payload.image = req.file.path;
  }
  console.log("payload", payload)
  const updatedProfile = await ModeratorService.updateMyProfile(userId, payload);
  sendResponse(res, {
    httpStatusCode: httpStatus.OK,
    success: true,
    message: "Moderator profile updated successfully",
    data: updatedProfile,
  });
});

const getAllModerators = catchAsync(async (req: Request, res: Response) => {
  const result = await ModeratorService.getAllModerators(req.query as any);
  sendResponse(res, {
    httpStatusCode: httpStatus.OK,
    success: true,
    message: "Moderators retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const toggleModeratorStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ModeratorService.toggleModeratorStatus(id as string);
  sendResponse(res, {
    httpStatusCode: httpStatus.OK,
    success: true,
    message: "Moderator status toggled successfully",
    data: result,
  });
});

export const ModeratorController = {
  getMyProfile,
  updateMyProfile,
  getAllModerators,
  toggleModeratorStatus,
};
