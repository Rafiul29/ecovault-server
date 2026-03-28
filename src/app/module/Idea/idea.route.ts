import express from "express";
import { IdeaController } from "./idea.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "@/generated/prisma/enums";

const router = express.Router();

router.get("/", IdeaController.getAllIdeas);
router.get("/:id", IdeaController.getIdeaById);

router.post("/", checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.MODERATOR), IdeaController.createIdea);
router.put("/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.MODERATOR), IdeaController.updateIdea);
router.delete("/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.MODERATOR), IdeaController.deleteIdea);

export const IdeaRoutes = router;
