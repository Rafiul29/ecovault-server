import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { ModeratorService } from "./moderator.service";

const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const profile = await ModeratorService.getMyProfile(userId);
  sendResponse(res, {
    httpStatusCode: httpStatus.OK,
    success: true,
    message: "Moderator profile retrieved successfully",
    data: profile,
  });
});

const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const updatedProfile = await ModeratorService.updateMyProfile(userId, req.body);
  sendResponse(res, {
    httpStatusCode: httpStatus.OK,
    success: true,
    message: "Moderator profile updated successfully",
    data: updatedProfile,
  });
});

const getAllModerators = catchAsync(async (req: Request, res: Response) => {
  const moderators = await ModeratorService.getAllModerators();
  sendResponse(res, {
    httpStatusCode: httpStatus.OK,
    success: true,
    message: "All moderators retrieved successfully",
    data: moderators,
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
