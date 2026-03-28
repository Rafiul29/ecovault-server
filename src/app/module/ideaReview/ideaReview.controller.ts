import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { IdeaReviewService } from "./ideaReview.service";

const createIdeaReview = catchAsync(async (req: Request, res: Response) => {
  const reviewerId = req.user!.userId;
  const result = await IdeaReviewService.createIdeaReview(req.body, reviewerId);
  sendResponse(res, {
    httpStatusCode: httpStatus.CREATED,
    success: true,
    message: "Idea reviewed successfully",
    data: result,
  });
});

const getReviewHistoryByIdea = catchAsync(async (req: Request, res: Response) => {
  const { ideaId } = req.params;
  const reviews = await IdeaReviewService.getReviewHistoryByIdea(ideaId as string);
  sendResponse(res, {
    httpStatusCode: httpStatus.OK,
    success: true,
    message: "Review history retrieved successfully",
    data: reviews,
  });
});

export const IdeaReviewController = {
  createIdeaReview,
  getReviewHistoryByIdea,
};
