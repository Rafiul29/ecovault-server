import { Router } from "express";
import { AuthRoutes } from "../module/auth/auth.route";
import { AdminRoutes } from "../module/admin/admin.route";
import { CategoryRoutes } from "../module/category/category.route";

const router = Router();

router.use("/auth", AuthRoutes);    
router.use("/admins", AdminRoutes);
router.use("/categories", CategoryRoutes);

export const IndexRoutes:Router = router;
