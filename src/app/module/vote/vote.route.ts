import express from "express";
import { Role } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { VoteController } from "./vote.controller";
import { voteZodSchema } from "./vote.validator";

const router = express.Router();

router.get("/summary/:ideaId", VoteController.getIdeaVotesSummary);

router.post(
  "/",
  checkAuth(Role.MEMBER, Role.MODERATOR, Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(voteZodSchema),
  VoteController.toggleVote
);

export const VoteRoutes = router;
