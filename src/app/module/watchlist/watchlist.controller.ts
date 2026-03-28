import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { WatchlistService } from "./watchlist.service";

const toggleWatchlist = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { ideaId } = req.body;
  const result = await WatchlistService.toggleWatchlist(userId, ideaId);
  sendResponse(res, {
    httpStatusCode: httpStatus.OK,
    success: true,
    message: `Idea ${result.action} successfully to watchlist`,
    data: result,
  });
});

const getMyWatchlist = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const watchlist = await WatchlistService.getMyWatchlist(userId);
  sendResponse(res, {
    httpStatusCode: httpStatus.OK,
    success: true,
    message: "Watchlist retrieved successfully",
    data: watchlist,
  });
});

export const WatchlistController = {
  toggleWatchlist,
  getMyWatchlist,
};
