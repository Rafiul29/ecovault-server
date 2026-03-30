import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { CategoryController } from "./category.controller";
import { createCategoryZodSchema, updateCategoryZodSchema } from "./category.validator";
import { multerUpload } from "@/app/config/multer.config";

const router = Router();

router.get("/", CategoryController.getAllCategories);
router.get("/:id", CategoryController.getCategoryById);

router.post("/", multerUpload.single('file'), checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.MODERATOR), validateRequest(createCategoryZodSchema), CategoryController.createCategory);
router.patch("/:id", multerUpload.single('file'), checkAuth(Role.ADMIN, Role.SUPER_ADMIN), validateRequest(updateCategoryZodSchema), CategoryController.updateCategory);
router.delete("/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), CategoryController.deleteCategory);

export const CategoryRoutes = router;
