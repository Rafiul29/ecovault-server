import { Request, Response } from "express";
import status from "http-status";
import { Role } from "../../../generated/prisma/enums";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { TagService } from "./tag.service";
import { IQueryParams } from "../../interfaces/query.interface";

const getAllTags = catchAsync(async (req: Request, res: Response) => {
    const result = await TagService.getAllTags(req.query as IQueryParams);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Tags fetched successfully",
        data: result.data,
        meta: result.meta,
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
    const userRole = req.user?.role;
    const isPermanent = req.query?.permanent === 'true';

    let result;
    if (isPermanent && (userRole === Role.ADMIN || userRole === Role.SUPER_ADMIN)) {
        result = await TagService.deleteTagPermanently(id);
    } else {
        result = await TagService.deleteTag(id);
    }

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: result.message,
    });
});

export const TagController = {
    getAllTags,
    getTagById,
    createTag,
    updateTag,
    deleteTag,
};
