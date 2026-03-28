import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { CategoryService } from "./category.service";

const getAllCategories = catchAsync(async (req: Request, res: Response) => {
    const categories = await CategoryService.getAllCategories();
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Categories fetched successfully",
        data: categories,
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
    console.log("Creating category with payload:", req.user); // Debug log
    const payload = req.body;
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
    const payload = req.body;
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
    const result = await CategoryService.deleteCategory(id);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Category deleted successfully",
        data: result,
    });
});

export const CategoryController = {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
};
