import { Request, Response } from "express";
import httpStatus from "http-status";
import { IdeaService } from "./idea.service";
import { ICreateIdeaPayload, IUpdateIdeaPayload } from "./idea.interface";
import { createIdeaZodSchema, updateIdeaZodSchema } from "./idea.validator";
import { validateRequest } from "../../middleware/validateRequest";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";

const getAllIdeas = catchAsync(async (req: Request, res: Response) => {
    const ideas = await IdeaService.getAllIdeas();
    sendResponse(res, {
        httpStatusCode: httpStatus.OK,
        success: true,
        message: "Ideas retrieved successfully",
        data: ideas,
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

const createIdea = [
    validateRequest(createIdeaZodSchema),
    catchAsync(async (req: Request, res: Response) => {
        const payload: ICreateIdeaPayload = req.body;
        const authorId = req.user?.userId;
        const idea = await IdeaService.createIdea(payload, authorId);
        sendResponse(res, {
            httpStatusCode: httpStatus.CREATED,
            success: true,
            message: "Idea created successfully",
            data: idea,
        });
    }),
];

const updateIdea = [
    validateRequest(updateIdeaZodSchema),
    catchAsync(async (req: Request, res: Response) => {
        const id = String(req.params.id);
        const payload: IUpdateIdeaPayload = req.body;
        const authorId = req.user?.userId;
        const idea = await IdeaService.updateIdea(id, payload, authorId);
        sendResponse(res, {
            httpStatusCode: httpStatus.OK,
            success: true,
            message: "Idea updated successfully",
            data: idea,
        });
    }),
];

const deleteIdea = catchAsync(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const authorId = req.user?.userId;
    const result = await IdeaService.deleteIdea(id, authorId);
    sendResponse(res, {
        httpStatusCode: httpStatus.OK,
        success: true,
        message: result.message,
    });
});

export const IdeaController = {
    getAllIdeas,
    getIdeaById,
    createIdea,
    updateIdea,
    deleteIdea,
};
