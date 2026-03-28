import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelpers/AppError";
import { IModeratorPayload } from "./moderator.interface";

const getMyProfile = async (userId: string) => {
  const profile = await prisma.moderator.findUnique({
    where: { userId },
    include: { user: { select: { email: true, role: true, status: true } } },
  });

  if (!profile) {
    throw new AppError(httpStatus.NOT_FOUND, "Moderator profile not found");
  }

  return profile;
};

const updateMyProfile = async (userId: string, payload: IModeratorPayload) => {
  const moderator = await prisma.moderator.findUnique({
    where: { userId },
  });

  if (!moderator) {
    throw new AppError(httpStatus.NOT_FOUND, "Moderator profile not found");
  }

  // Use transaction to sync name update to User model
  const result = await prisma.$transaction(async (tx) => {
    // 1. Update Moderator profile
    const updatedMod = await tx.moderator.update({
      where: { userId },
      data: payload,
    });

    // 2. If name is provided, update User model name as well
    if (payload.name) {
      await tx.user.update({
        where: { id: userId },
        data: { name: payload.name },
      });
    }

    return updatedMod;
  });

  return result;
};

const getAllModerators = async () => {
  return await prisma.moderator.findMany({
    include: { user: { select: { status: true, updatedAt: true } } },
  });
};

const toggleModeratorStatus = async (id: string) => {
  const mod = await prisma.moderator.findUnique({ where: { id } });
  if (!mod) {
    throw new AppError(httpStatus.NOT_FOUND, "Moderator not found");
  }

  return await prisma.moderator.update({
    where: { id },
    data: { isActive: !mod.isActive },
  });
};

export const ModeratorService = {
  getMyProfile,
  updateMyProfile,
  getAllModerators,
  toggleModeratorStatus,
};
