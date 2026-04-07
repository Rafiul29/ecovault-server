import { Role, UserStatus } from "../../../generated/prisma/enums";

export interface IUpdateAdminPayload {
    name?: string;
    profilePhoto?: string;
    contactNumber?: string;
}

export interface ICreateAdminPayload extends Omit<IUpdateAdminPayload, 'name'> {
    name: string;
    email: string;
    password: string;
}

export interface IChangeUserStatusPayload {
    userId: string;
    userStatus: UserStatus;
}

export interface IChangeUserRolePayload {
    userId: string;
    role: Role;
}