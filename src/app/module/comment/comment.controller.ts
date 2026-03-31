import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { CommentService } from "./comment.service";

const createComment = catchAsync(async (req: Request, res: Response) => {
  const authorId = req.user!.userId;
  const comment = await CommentService.createComment(req.body, authorId);
  sendResponse(res, {
    httpStatusCode: httpStatus.CREATED,
    success: true,
    message: "Comment created successfully",
    data: comment,
  });
});

const getCommentsByIdea = catchAsync(async (req: Request, res: Response) => {
  const ideaId = req.params.ideaId as string;
  const comments = await CommentService.getCommentsByIdea(ideaId);
  sendResponse(res, {
    httpStatusCode: httpStatus.OK,
    success: true,
    message: "Comments retrieved successfully",
    data: comments,
  });
});

const updateComment = catchAsync(async (req: Request, res: Response) => {
  const authorId = req.user!.userId;
  const id = req.params.id as string;
  const comment = await CommentService.updateComment(id, req.body.content, authorId);
  sendResponse(res, {
    httpStatusCode: httpStatus.OK,
    success: true,
    message: "Comment updated successfully",
    data: comment,
  });
});

const deleteComment = catchAsync(async (req: Request, res: Response) => {
  const authorId = req.user!.userId;
  const userRole = req.user!.role;
  const id = req.params.id as string;
  const result = await CommentService.deleteComment(id, authorId, userRole);
  sendResponse(res, {
    httpStatusCode: httpStatus.OK,
    success: true,
    message: "Comment deleted successfully",
    data: result,
  });
});

const toggleCommentReaction = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const result = await CommentService.toggleCommentReaction(req.body, userId);
  sendResponse(res, {
    httpStatusCode: httpStatus.OK,
    success: true,
    message: `Comment reaction ${result.action} successfully`,
    data: result,
  });
});

const getAllComments = catchAsync(async (req: Request, res: Response) => {
  const queryParams = req.query;
  const result = await CommentService.getAllCommentsFromDb(queryParams);
  sendResponse(res, {
    httpStatusCode: httpStatus.OK,
    success: true,
    message: "All comments retrieved successfully",
    data: result,
  });
});

export const CommentController = {
  createComment,
  getCommentsByIdea,
  updateComment,
  deleteComment,
  toggleCommentReaction,
  getAllComments,
};
