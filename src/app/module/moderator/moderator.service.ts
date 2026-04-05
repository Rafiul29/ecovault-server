import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelpers/AppError";
import { IModeratorPayload } from "./moderator.interface";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { IQueryParams } from "../../interfaces/query.interface";
import { moderatorIncludeConfig } from "./moderator.constant";

const getMyProfile = async (userId: string) => {
  const profile = await prisma.moderator.findUnique({
    where: { userId },
    include: { user: { select: { id: true, name: true, email: true, image: true, role: true, status: true } } },
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
        data: {
          name: payload.name,
          ...(payload.image !== undefined && { image: payload.image }),
        },
      });
    }

    return updatedMod;
  });

  return result;
};

const getAllModerators = async (queryParams: IQueryParams) => {
  const queryBuilder = new QueryBuilder(
    prisma.moderator,
    queryParams,
    {
      searchableFields: ['name', 'user.email'],
      filterableFields: ['isActive', 'user.status']
    }
  );

  return await queryBuilder
    .search()
    .filter()
    .paginate()
    .sort()
    .include(moderatorIncludeConfig)
    .execute();
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
