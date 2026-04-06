import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { AdminService } from "./admin.service";

const getAllAdmins = catchAsync(
    async (req: Request, res: Response) => {
        const result = await AdminService.getAllAdmins();

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Admins fetched successfully",
            data: result,
        })
    }
)

const getAdminById = catchAsync(
    async (req: Request, res: Response) => {
        const { id } = req.params;

        const admin = await AdminService.getAdminById(String(id));

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Admin fetched successfully",
            data: admin,
        })
    }
)

const getPublicProfileByUserId = catchAsync(
    async (req: Request, res: Response) => {
        const { id } = req.params;

        const user = await AdminService.getPublicProfileByUserId(String(id));

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Public Profile fetched successfully",
            data: user,
        })
    }
)

const updateAdmin = catchAsync(
    async (req: Request, res: Response) => {
        const { id } = req.params;
        const payload = req.body;
        console.log("Payload", payload)

        if (req.file) {
            payload.profilePhoto = req.file.path;
        }

        const updatedAdmin = await AdminService.updateAdmin(String(id), payload);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Admin updated successfully",
            data: updatedAdmin,
        })
    }
)

const deleteAdmin = catchAsync(
    async (req: Request, res: Response) => {
        const { id } = req.params;
        const user = req.user;

        const result = await AdminService.deleteAdmin(id as string, user);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Admin deleted successfully",
            data: result,
        })
    }

)

const changeUserStatus = catchAsync(
    async (req: Request, res: Response) => {
        const user = req.user;
        const payload = req.body;
        const result = await AdminService.changeUserStatus(user, payload);
        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "User status changed successfully",
            data: result,
        })
    }
);

const changeUserRole = catchAsync(
    async (req: Request, res: Response) => {
        const user = req.user;
        const payload = req.body;
        const result = await AdminService.changeUserRole(user, payload);
        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "User role changed successfully",
            data: result,
        })
    }
);


const getAllUsers = catchAsync(async (req: Request, res: Response) => {
    const result = await AdminService.getAllUsers(req.query as any);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Users fetched successfully",
        data: result.data,
        meta: result.meta,
    });
});

const getUserById = catchAsync(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const result = await AdminService.getUserById(id);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "User fetched successfully",
        data: result,
    });
});

const deleteUserAccount = catchAsync(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const requester = req.user;
    const result = await AdminService.deleteUserAccount(id, requester as any);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "User account soft-deleted successfully",
        data: result,
    });
});

export const AdminController = {
    getAllAdmins,
    updateAdmin,
    deleteAdmin,
    getAdminById,
    getPublicProfileByUserId,
    changeUserStatus,
    changeUserRole,
    getAllUsers,
    getUserById,
    deleteUserAccount
};