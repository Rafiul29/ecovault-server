import { Request, Response } from "express";
import httpStatus from "http-status";
import { IdeaService } from "./idea.service";
import { ICreateIdeaPayload, IUpdateIdeaPayload } from "./idea.interface";
import { createIdeaZodSchema, updateIdeaZodSchema } from "./idea.validator";
import { validateRequest } from "../../middleware/validateRequest";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { Role } from "@/generated/prisma/enums";
import { IQueryParams } from "@/app/interfaces/query.interface";

const getAllIdeas = catchAsync(async (req: Request, res: Response) => {
    const result = await IdeaService.getAllIdeas(req.query as IQueryParams);
    sendResponse(res, {
        httpStatusCode: httpStatus.OK,
        success: true,
        message: "Ideas retrieved successfully",
        data: result.data,
        meta: result.meta,
    });
});

const getMyIdeas = catchAsync(async (req: Request, res: Response) => {
    const authorId = req.user?.userId;
    const result = await IdeaService.getMyIdeas(authorId, req.query as IQueryParams);
    sendResponse(res, {
        httpStatusCode: httpStatus.OK,
        success: true,
        message: "My ideas retrieved successfully",
        data: result.data,
        meta: result.meta,
    });
});

const getIdeaById = catchAsync(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const idea = await IdeaService.getIdeaById(id);
    sendResponse(res, {
        httpStatusCode: httpStatus.OK,
        success: true,
        message: "Idea retrieved successfully",
        data: idea,
    });
});

const createIdea = catchAsync(async (req: Request, res: Response) => {
    const payload = {
        ...req.body,
        images: (req.files as any[])?.map((file: any) => file.path) || []
    };

    const authorId = req.user?.userId;
    const idea = await IdeaService.createIdea(payload, authorId);
    sendResponse(res, {
        httpStatusCode: httpStatus.CREATED,
        success: true,
        message: "Idea created successfully",
        data: idea,
    });
});

const updateIdea = catchAsync(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const payload = {
        ...req.body,
    };

    if (req.files && (req.files as any[]).length > 0) {
        payload.images = (req.files as any[]).map((file: any) => file.path);
    }

    const authorId = req.user?.userId;
    const idea = await IdeaService.updateIdea(id, payload, authorId);
    sendResponse(res, {
        httpStatusCode: httpStatus.OK,
        success: true,
        message: "Idea updated successfully",
        data: idea,
    });
});

const deleteIdea = catchAsync(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const authorId = req.user?.userId;
    const userRole = req.user?.role;
    const isPermanent = req.query?.permanent === 'true';

    let result;
    if (isPermanent && (userRole === Role.ADMIN || userRole === Role.SUPER_ADMIN)) {
        result = await IdeaService.deleteIdeaPermanently(id);
    } else {
        // If an admin/super admin is doing a soft delete, we might want to bypass authorId check
        // Or we just pass a flag
        const effectiveAuthorId = (userRole === Role.ADMIN || userRole === Role.SUPER_ADMIN) 
            ? "SUPER_ADMIN_BYPASS" 
            : authorId;
            
        result = await IdeaService.deleteIdea(id, effectiveAuthorId);
    }

    sendResponse(res, {
        httpStatusCode: httpStatus.OK,
        success: true,
        message: result.message,
    });
});

export const IdeaController = {
    getAllIdeas,
    getMyIdeas,
    getIdeaById,
    createIdea,
    updateIdea,
    deleteIdea,
};
