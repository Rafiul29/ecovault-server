import express from "express";
import { IdeaController } from "./idea.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "@/generated/prisma/enums";
import { validateRequest } from "@/app/middleware/validateRequest";
import { createIdeaZodSchema, updateIdeaZodSchema } from "./idea.validator";
import { multerUpload } from "@/app/config/multer.config";

const router = express.Router();

router.get("/", IdeaController.getAllIdeas);
router.get("/my-ideas", checkAuth(Role.MEMBER, Role.MODERATOR, Role.ADMIN, Role.SUPER_ADMIN), IdeaController.getMyIdeas);
router.get("/:id", IdeaController.getIdeaById);

router.post("/", multerUpload.array('files', 5), validateRequest(createIdeaZodSchema), checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.MODERATOR), IdeaController.createIdea);
router.put("/:id", multerUpload.array('files', 5), validateRequest(updateIdeaZodSchema), checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.MODERATOR), IdeaController.updateIdea);
router.delete("/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.MODERATOR), IdeaController.deleteIdea);

export const IdeaRoutes = router;
