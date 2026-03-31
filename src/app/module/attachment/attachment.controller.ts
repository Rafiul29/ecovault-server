import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { AttachmentService } from "./attachment.service";

const createAttachment = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const role = req.user!.role;

  const payload = {
    ...req.body,
    url:  req.file?.path
  }
  const attachment = await AttachmentService.createAttachment(payload, userId, role);
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

const downloadAttachment = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const attachment = await AttachmentService.getAttachmentById(id as string);

  if (!attachment) {
    return sendResponse(res, {
      httpStatusCode: httpStatus.NOT_FOUND,
      success: false,
      message: "Attachment not found",
    });
  }

  // For Cloudinary URLs, append the fl_attachment flag to force download
  if (attachment.url.includes('cloudinary')) {
    const downloadUrl = attachment.url.replace('/upload/', '/upload/fl_attachment/');
    res.redirect(downloadUrl);
  } else {
    // For local files (if any), you could serve them directly
    res.redirect(attachment.url);
  }
});

export const AttachmentController = {
  createAttachment,
  getAttachmentsByIdea,
  deleteAttachment,
  downloadAttachment,
};
