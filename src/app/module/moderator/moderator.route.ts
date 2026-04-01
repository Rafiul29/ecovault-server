import express, { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { ModeratorController } from "./moderator.controller";
import { updateModeratorZodSchema } from "./moderator.validator";

const router = express.Router();

router.get(
  "/profile",
  checkAuth(Role.MODERATOR),
  ModeratorController.getMyProfile
);

router.patch(
  "/profile",
  checkAuth(Role.MODERATOR),
  validateRequest(updateModeratorZodSchema),
  ModeratorController.updateMyProfile
);

// Admin-only moderator management
router.get(
  "/",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  ModeratorController.getAllModerators
);

router.patch(
  "/toggle-status/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  ModeratorController.toggleModeratorStatus
);

export const ModeratorRoutes: Router = router;
