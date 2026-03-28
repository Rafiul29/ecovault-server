import express from "express";
import { Role } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { AttachmentController } from "./attachment.controller";
import { createAttachmentZodSchema } from "./attachment.validator";

const router = express.Router();

router.get("/idea/:ideaId", AttachmentController.getAttachmentsByIdea);

router.post(
  "/",
  checkAuth(Role.MEMBER, Role.MODERATOR, Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(createAttachmentZodSchema),
  AttachmentController.createAttachment
);

router.delete(
  "/:id",
  checkAuth(Role.MEMBER, Role.MODERATOR, Role.ADMIN, Role.SUPER_ADMIN),
  AttachmentController.deleteAttachment
);

export const AttachmentRoutes = router;
