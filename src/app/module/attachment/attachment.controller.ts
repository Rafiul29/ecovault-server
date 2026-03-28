import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { AttachmentService } from "./attachment.service";

const createAttachment = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const role = req.user!.role;
  const attachment = await AttachmentService.createAttachment(req.body, userId, role);
  sendResponse(res, {
    httpStatusCode: httpStatus.CREATED,
    success: true,
    message: "Attachment added successfully",
    data: attachment,
  });
});

const getAttachmentsByIdea = catchAsync(async (req: Request, res: Response) => {
  const { ideaId } = req.params;
  const attachments = await AttachmentService.getAttachmentsByIdea(ideaId as string);
  sendResponse(res, {
    httpStatusCode: httpStatus.OK,
    success: true,
    message: "Attachments retrieved successfully",
    data: attachments,
  });
});

const deleteAttachment = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const role = req.user!.role;
  const { id } = req.params;
  const result = await AttachmentService.deleteAttachment(id as string, userId, role);
  sendResponse(res, {
    httpStatusCode: httpStatus.OK,
    success: true,
    message: "Attachment deleted successfully",
    data: result,
  });
});

export const AttachmentController = {
  createAttachment,
  getAttachmentsByIdea,
  deleteAttachment,
};
