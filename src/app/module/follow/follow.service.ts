import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelpers/AppError";

const toggleFollow = async (followerId: string, followingId: string) => {
  if (followerId === followingId) {
    throw new AppError(httpStatus.BAD_REQUEST, "You cannot follow yourself");
  }

  const followingUser = await prisma.user.findUnique({ where: { id: followingId } });
  if (!followingUser) {
    throw new AppError(httpStatus.NOT_FOUND, "User to follow not found");
  }

  const existingFollow = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId, followingId } },
  });

  if (existingFollow) {
    await prisma.follow.delete({
      where: { followerId_followingId: { followerId, followingId } },
    });
    return { action: "unfollowed" };
  }

  await prisma.follow.create({
    data: { followerId, followingId },
  });

  return { action: "followed" };
};

const getUserFollowers = async (userId: string) => {
  const followers = await prisma.follow.findMany({
    where: { followingId: userId },
    include: {
      follower: { select: { id: true, name: true, image: true, role: true } },
    },
  });
  return followers;
};

const getUserFollowing = async (userId: string) => {
  const following = await prisma.follow.findMany({
    where: { followerId: userId },
    include: {
      following: { select: { id: true, name: true, image: true, role: true } },
    },
  });
  return following;
};

export const FollowService = {
  toggleFollow,
  getUserFollowers,
  getUserFollowing,
};
