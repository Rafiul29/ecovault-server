import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { VoteService } from "./vote.service";

const toggleVote = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const result = await VoteService.toggleVote(req.body, userId);
  sendResponse(res, {
    httpStatusCode: httpStatus.OK,
    success: true,
    message: `Vote ${result.action} successfully`,
    data: result,
  });
});

const getIdeaVotesSummary = catchAsync(async (req: Request, res: Response) => {
  const ideaId = req.params.ideaId as string;
  const summary = await VoteService.getIdeaVotesSummary(ideaId);
  sendResponse(res, {
    httpStatusCode: httpStatus.OK,
    success: true,
    message: "Votes summary retrieved successfully",
    data: summary,
  });
});

export const VoteController = {
  toggleVote,
  getIdeaVotesSummary,
};
