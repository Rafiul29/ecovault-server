import express from "express";
import { Router } from "express";
import { IdeaController } from "./idea.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { validateRequest } from "../../middleware/validateRequest";
import { createIdeaZodSchema, updateIdeaZodSchema } from "./idea.validator";
import { multerUpload } from "../../config/multer.config";

const router = express.Router();

router.get("/", IdeaController.getAllIdeas);
router.get("/my-ideas", checkAuth(Role.MEMBER, Role.MODERATOR, Role.ADMIN, Role.SUPER_ADMIN), IdeaController.getMyIdeas);
router.get("/sold-ideas", checkAuth(Role.MODERATOR), IdeaController.getSoldIdeas);
router.get("/my-purchases", checkAuth(Role.MEMBER), IdeaController.getMyPurchases);

router.get("/:id", IdeaController.getIdeaById);

router.post("/", multerUpload.array('files', 5), validateRequest(createIdeaZodSchema), checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.MODERATOR), IdeaController.createIdea);
router.put("/:id", multerUpload.array('files', 5), validateRequest(updateIdeaZodSchema), checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.MODERATOR), IdeaController.updateIdea);
router.delete("/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.MODERATOR), IdeaController.deleteIdea);

router.post("/purchase", checkAuth(Role.MODERATOR, Role.MEMBER), IdeaController.purchaseIdea);

export const IdeaRoutes: Router = router;
