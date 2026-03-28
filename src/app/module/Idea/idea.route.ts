import express from "express";
import { IdeaController } from "./idea.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "@/generated/prisma/enums";
import { validateRequest } from "@/app/middleware/validateRequest";
import { createIdeaZodSchema, updateIdeaZodSchema } from "./idea.validator";

const router = express.Router();

router.get("/", IdeaController.getAllIdeas);
router.get("/:id", IdeaController.getIdeaById);

router.post("/", validateRequest(createIdeaZodSchema), checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.MODERATOR), IdeaController.createIdea);
router.put("/:id", validateRequest(updateIdeaZodSchema), checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.MODERATOR), IdeaController.updateIdea);
router.delete("/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.MODERATOR), IdeaController.deleteIdea);

export const IdeaRoutes = router;
