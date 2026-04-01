import express, { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { FollowController } from "./follow.controller";
import { followZodSchema } from "./follow.validator";

const router = express.Router();

router.get("/followers/:userId", FollowController.getUserFollowers);
router.get("/following/:userId", FollowController.getUserFollowing);

router.post(
  "/",
  checkAuth(Role.MEMBER, Role.MODERATOR, Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(followZodSchema),
  FollowController.toggleFollow
);

export const FollowRoutes: Router = router;
