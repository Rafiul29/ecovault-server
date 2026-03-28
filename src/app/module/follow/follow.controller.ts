import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { FollowService } from "./follow.service";

const toggleFollow = catchAsync(async (req: Request, res: Response) => {
  const followerId = req.user!.userId;
  const { followingId } = req.body;
  const result = await FollowService.toggleFollow(followerId, followingId);
  sendResponse(res, {
    httpStatusCode: httpStatus.OK,
    success: true,
    message: `User ${result.action} successfully`,
    data: result,
  });
});

const getUserFollowers = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.userId as string;
  const followers = await FollowService.getUserFollowers(userId);
  sendResponse(res, {
    httpStatusCode: httpStatus.OK,
    success: true,
    message: "Followers retrieved successfully",
    data: followers,
  });
});

const getUserFollowing = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.userId as string;
  const following = await FollowService.getUserFollowing(userId);
  sendResponse(res, {
    httpStatusCode: httpStatus.OK,
    success: true,
    message: "Following users retrieved successfully",
    data: following,
  });
});

export const FollowController = {
  toggleFollow,
  getUserFollowers,
  getUserFollowing,
};
