import httpStatus from "http-status";
import { Role, UserStatus } from "../../../generated/prisma/enums";
import AppError from "../../errorHelpers/AppError";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { prisma } from "../../lib/prisma";
import { IChangeUserRolePayload, IChangeUserStatusPayload, IUpdateAdminPayload } from "./admin.interface";

const getAllAdmins = async () => {
    const admins = await prisma.admin.findMany({
        include: {
            user: true,
        }
    })
    return admins;
}

const getAdminById = async (id: string) => {
    const admin = await prisma.admin.findUnique({
        where: {
            id,
        },
        include: {
            user: true,
        }
    })
    return admin;
}

const getPublicProfileByUserId = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            admin: true,
            moderator: true,
            _count: {
                select: {
                    ideas: true,
                    followers: true,
                    following: true,
                }
            }
        }
    });

    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User profile not found");
    }

    // Since this is a public profile, we might want to omit sensitive fields like 'password' if it existed,
    // but the 'user' table is mostly safe. We'll return it as is since it doesn't contain passwords directly.
    return user;
};

const updateAdmin = async (id: string, payload: IUpdateAdminPayload) => {
    //TODO: Validate who is updating the admin user. Only super admin can update admin user and only super admin can update super admin user but admin user cannot update super admin user

    const isAdminExist = await prisma.admin.findUnique({
        where: {
            id,
        }
    })

    if (!isAdminExist) {
        throw new AppError(httpStatus.NOT_FOUND, "Admin Or Super Admin not found");
    }

    const { admin } = payload;

    const updatedAdmin = await prisma.admin.update({
        where: {
            id,
        },
        data: {
            ...admin,
        }
    })

    const updatedUser = await prisma.user.update({
        where: {
            id: isAdminExist.userId,
        },
        data: {
            name: updatedAdmin.name,
            image: updatedAdmin.profilePhoto,

        }
    })

    return updatedAdmin;
}

//soft delete admin user by setting isDeleted to true and also delete the user session and account
const deleteAdmin = async (id: string, user: IRequestUser) => {
    //TODO: Validate who is deleting the admin user. Only super admin can delete admin user and only super admin can delete super admin user but admin user cannot delete super admin user


    const isAdminExist = await prisma.admin.findUnique({
        where: {
            id,
        }
    })

    if (!isAdminExist) {
        throw new AppError(httpStatus.NOT_FOUND, "Admin Or Super Admin not found");
    }

    if (isAdminExist.id === user.userId) {
        throw new AppError(httpStatus.BAD_REQUEST, "You cannot delete yourself");
    }

    const result = await prisma.$transaction(async (tx) => {
        await tx.admin.update({
            where: { id },
            data: {
                isDeleted: true,
                deletedAt: new Date(),
            },
        })

        await tx.user.update({
            where: { id: isAdminExist.userId },
            data: {
                isDeleted: true,
                deletedAt: new Date(),
                status: UserStatus.DELETED // Optional: you may also want to block the user
            },
        })

        await tx.session.deleteMany({
            where: { userId: isAdminExist.userId }
        })

        await tx.account.deleteMany({
            where: { userId: isAdminExist.userId }
        })

        const admin = await getAdminById(id);

        return admin;
    }
    )

    return result;
}

const changeUserStatus = async (user: IRequestUser, payload: IChangeUserStatusPayload) => {
    // 1. Super admin can change the status of any user (admin, doctor, patient). Except himself. He cannot change his own status.

    // 2. Admin can change the status of doctor and patient. Except himself. He cannot change his own status. He cannot change the status of super admin and other admin user.

    const isAdminExists = await prisma.admin.findUniqueOrThrow({
        where: {
            email: user.email
        },
        include: {
            user: true,
        }
    });

    const { userId, userStatus } = payload;


    const userToChangeStatus = await prisma.user.findUniqueOrThrow({
        where: {
            id: userId,
        }
    })

    const selfStatusChange = isAdminExists.userId === userId;

    if (selfStatusChange) {
        throw new AppError(httpStatus.BAD_REQUEST, "You cannot change your own status");
    };

    if (isAdminExists.user.role === Role.ADMIN && userToChangeStatus.role === Role.SUPER_ADMIN) {
        throw new AppError(httpStatus.BAD_REQUEST, "You cannot change the status of super admin. Only super admin can change the status of another super admin");
    }

    if (isAdminExists.user.role === Role.ADMIN && userToChangeStatus.role === Role.ADMIN) {
        throw new AppError(httpStatus.BAD_REQUEST, "You cannot change the status of another admin. Only super admin can change the status of another admin");
    }

    if (userStatus === UserStatus.DELETED) {
        throw new AppError(httpStatus.BAD_REQUEST, "You cannot set user status to deleted. To delete a user, you have to use role specific delete api. For example, to delete an doctor user, you have to use delete doctor api which will set the user status to deleted and also set isDeleted to true and also delete the user session and account");
    }

    const updatedUser = await prisma.user.update({
        where: {
            id: userId,
        }, data: {
            status: userStatus,
        }
    })

    return updatedUser;
}

const changeUserRole = async (user: IRequestUser, payload: IChangeUserRolePayload) => {
    // 1. Super admin can change the role of only other super admin and admin user. He cannot change his own role.

    // 2. Admin cannot change role of any user

    // 3. Role of Patient and Doctor user cannot be changed by anyone. If needed, they have to be deleted and recreated with new role.

    const isSuperAdminExists = await prisma.admin.findFirstOrThrow({
        where: {
            email: user.email,
            user: {
                role: Role.SUPER_ADMIN
            }
        },
        include: {
            user: true,
        }
    });

    const { userId, role } = payload;

    const userToChangeRole = await prisma.user.findUniqueOrThrow({
        where: {
            id: userId,
        }
    })

    const selfRoleChange = isSuperAdminExists.userId === userId;

    if (selfRoleChange) {
        throw new AppError(httpStatus.BAD_REQUEST, "You cannot change your own role");
    }

    if (userToChangeRole.role === Role.MEMBER || userToChangeRole.role === Role.MODERATOR) {
        throw new AppError(httpStatus.BAD_REQUEST, "You cannot change the role of doctor or patient user. If you want to change the role of doctor or patient user, you have to delete the user and recreate with new role");
    }

    const updatedUser = await prisma.user.update({
        where: {
            id: userId,
        },
        data: {
            role,
        }
    })

    return updatedUser;

}

import { IQueryParams } from "../../interfaces/query.interface";
import { QueryBuilder } from "../../utils/QueryBuilder";

const getAllUsers = async (queryParams: IQueryParams) => {
    const userSearchableFields = ['name', 'email'];
    const userFilterableFields = ['role', 'status', 'isDeleted'];

    const userQuery = new QueryBuilder(prisma.user, queryParams, {
        searchableFields: userSearchableFields,
        filterableFields: userFilterableFields,
    })
        .search()
        .filter()
        .paginate()
        .sort();

    return await userQuery.execute();
}

const getUserById = async (id: string) => {
    const user = await prisma.user.findUnique({
        where: { id },
        include: {
            admin: true,
            moderator: true,
            _count: {
                select: {
                    ideas: true,
                    purchasedIdeas: true,
                    followers: true,
                    following: true
                }
            }
        }
    });

    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    return user;
}

const deleteUserAccount = async (id: string, requester: IRequestUser) => {
    const userToDelete = await prisma.user.findUniqueOrThrow({
        where: { id }
    });

    if (userToDelete.id === requester.userId) {
        throw new AppError(httpStatus.BAD_REQUEST, "You cannot delete your own account");
    }

    // RBAC: Only Super Admin can delete other Admins
    if (requester.role === Role.ADMIN && (userToDelete.role === Role.ADMIN || userToDelete.role === Role.SUPER_ADMIN)) {
        throw new AppError(httpStatus.FORBIDDEN, "Only Super Admin can delete other Admins/Super Admins");
    }

    return await prisma.$transaction(async (tx) => {
        // Soft delete user
        const updatedUser = await tx.user.update({
            where: { id },
            data: {
                isDeleted: true,
                deletedAt: new Date(),
                status: UserStatus.BLOCKED // Prevent login
            }
        });

        // If user is Admin/Moderator, handle their specific records
        if (userToDelete.role === Role.ADMIN || userToDelete.role === Role.SUPER_ADMIN) {
            await tx.admin.updateMany({
                where: { userId: id },
                data: { isDeleted: true, deletedAt: new Date() }
            });
        }
        if (userToDelete.role === Role.MODERATOR) {
            await tx.moderator.updateMany({
                where: { userId: id },
                data: { isDeleted: true, deletedAt: new Date() }
            });
        }
        // Cleanup sessions
        await tx.session.deleteMany({ where: { userId: id } });

        return updatedUser;
    });
}

export const AdminService = {
    getAllAdmins,
    getAdminById,
    getPublicProfileByUserId,
    updateAdmin,
    deleteAdmin,
    changeUserStatus,
    changeUserRole,
    getAllUsers,
    getUserById,
    deleteUserAccount
}