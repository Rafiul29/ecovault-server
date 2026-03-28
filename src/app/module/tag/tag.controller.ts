import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { TagService } from "./tag.service";

const getAllTags = catchAsync(async (req: Request, res: Response) => {
    const tags = await TagService.getAllTags();
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Tags fetched successfully",
        data: tags,
    });
});

const getTagById = catchAsync(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const tag = await TagService.getTagById(id);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Tag fetched successfully",
        data: tag,
    });
});

const createTag = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;
    const tag = await TagService.createTag(payload);
    sendResponse(res, {
        httpStatusCode: status.CREATED,
        success: true,
        message: "Tag created successfully",
        data: tag,
    });
});

const updateTag = catchAsync(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const payload = req.body;
    const tag = await TagService.updateTag(id, payload);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Tag updated successfully",
        data: tag,
    });
});

const deleteTag = catchAsync(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const result = await TagService.deleteTag(id);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Tag deleted successfully",
        data: result,
    });
});

export const TagController = {
    getAllTags,
    getTagById,
    createTag,
    updateTag,
    deleteTag,
};
