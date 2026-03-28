import { Router } from "express";
import { AuthRoutes } from "../module/auth/auth.route";
import { AdminRoutes } from "../module/admin/admin.route";
import { CategoryRoutes } from "../module/category/category.route";
import { TagRoutes } from "../module/tag/tag.route";
import { IdeaRoutes } from "../module/Idea/idea.route";

const router = Router();

router.use("/auth", AuthRoutes);    
router.use("/admins", AdminRoutes);
router.use("/categories", CategoryRoutes);
router.use("/tags", TagRoutes);
router.use("/ideas", IdeaRoutes);

export const IndexRoutes:Router = router;
