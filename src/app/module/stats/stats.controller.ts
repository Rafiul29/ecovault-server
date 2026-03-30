import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { StatsService } from "./stats.service";

const getDashboardStatsData = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;
    const result = await StatsService.getDashboardStatsData(user);

    sendResponse(res, {
        httpStatusCode: httpStatus.OK,
        success: true,
        message: "Stats data retrieved successfully!",
        data: result
    })
});

export const StatsController = {
    getDashboardStatsData
}
