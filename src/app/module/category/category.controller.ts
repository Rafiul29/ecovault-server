import { Request, Response } from "express";
import status from "http-status";
import { Role } from "../../../generated/prisma/enums";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { CategoryService } from "./category.service";
import { IQueryParams } from "../../interfaces/query.interface";

const getAllCategories = catchAsync(async (req: Request, res: Response) => {
    const result = await CategoryService.getAllCategories(req.query as IQueryParams);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Categories fetched successfully",
        data: result.data,
        meta: result.meta,
    });
});

const getCategoryById = catchAsync(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const category = await CategoryService.getCategoryById(id);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Category fetched successfully",
        data: category,
    });
});

const createCategory = catchAsync(async (req: Request, res: Response) => {
    const payload = {
        ...req.body,
        icon: req.file?.path
    };
    const category = await CategoryService.createCategory(payload);
    sendResponse(res, {
        httpStatusCode: status.CREATED,
        success: true,
        message: "Category created successfully",
        data: category,
    });
});

const updateCategory = catchAsync(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const payload = {
        ...req.body,
        icon: req.file?.path
    };
    const updated = await CategoryService.updateCategory(id, payload);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Category updated successfully",
        data: updated,
    });
});

const deleteCategory = catchAsync(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const userRole = req.user?.role;
    const isPermanent = req.query?.permanent === 'true';

    let result;
    if (isPermanent && (userRole === Role.ADMIN || userRole === Role.SUPER_ADMIN)) {
        result = await CategoryService.deleteCategoryPermanently(id);
    } else {
        result = await CategoryService.deleteCategory(id);
    }

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: result.message,
    });
});

export const CategoryController = {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
};
