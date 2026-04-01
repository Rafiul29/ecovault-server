import express, { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { CommentController } from "./comment.controller";
import { createCommentZodSchema, updateCommentZodSchema, commentReactionZodSchema } from "./comment.validator";

const router = express.Router();

router.get("/idea/:ideaId", CommentController.getCommentsByIdea);
router.get("/", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), CommentController.getAllComments);

router.post(
  "/",
  checkAuth(Role.MEMBER, Role.MODERATOR, Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(createCommentZodSchema),
  CommentController.createComment
);

router.patch(
  "/:id",
  checkAuth(Role.MEMBER, Role.MODERATOR, Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(updateCommentZodSchema),
  CommentController.updateComment
);

router.delete(
  "/:id",
  checkAuth(Role.MEMBER, Role.MODERATOR, Role.ADMIN, Role.SUPER_ADMIN),
  CommentController.deleteComment
);

router.post(
  "/react",
  checkAuth(Role.MEMBER, Role.MODERATOR, Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(commentReactionZodSchema),
  CommentController.toggleCommentReaction
);

export const CommentRoutes: Router = router;
