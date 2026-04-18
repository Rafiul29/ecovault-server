import { Role, UserStatus } from "@/generated/prisma/enums";
import z from "zod";

export const updateAdminZodSchema = z.object({
    name: z.string("Name must be a string").optional(),
    profilePhoto: z.string("Profile photo must be a valid URL").optional(),
    contactNumber: z.string("Contact number must be a string").min(11, "Contact number must be at least 11 characters").max(14, "Contact number must be at most 15 characters").optional(),
})

export const createAdminZodSchema = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    profilePhoto: z.string().optional(),
    contactNumber: z.string().min(11, "Contact number must be at least 11 characters").max(14, "Contact number must be at most 15 characters").optional(),
});

export const changeUserStatusZodSchema = z.object({
    userId: z.string(),
    userStatus: z.enum([UserStatus.ACTIVE, UserStatus.BLOCKED, UserStatus.DELETED]),
});

export const changeUserRoleZodSchema = z.object({
    userId: z.string(),
    role: z.enum([Role.ADMIN, Role.MODERATOR, Role.SUPER_ADMIN, Role.MEMBER]),
});