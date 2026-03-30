import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "@/generated/prisma/enums";
import { StatsController } from "./stats.controller";

const router = Router();

// Dashboard stats: accessible by all authenticated roles
router.get("/dashboard-stats", 
    checkAuth(Role.SUPER_ADMIN, Role.ADMIN, Role.MODERATOR, Role.MEMBER), 
    StatsController.getDashboardStatsData
);

export const StatsRoutes = router;
