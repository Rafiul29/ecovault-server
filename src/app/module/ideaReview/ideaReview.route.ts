import express from "express";
import { Role } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { IdeaReviewController } from "./ideaReview.controller";
import { createIdeaReviewZodSchema } from "./ideaReview.validator";

const router = express.Router();

router.get("/idea/:ideaId", IdeaReviewController.getReviewHistoryByIdea);

router.post(
  "/",
  checkAuth(Role.MODERATOR, Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(createIdeaReviewZodSchema),
  IdeaReviewController.createIdeaReview
);

export const IdeaReviewRoutes = router;
