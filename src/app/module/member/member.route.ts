import express from "express";
import { MemberController } from "./member.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "@/generated/prisma/enums";

const router = express.Router();

// All routes require member or higher role
router.use(checkAuth(Role.MEMBER, Role.MODERATOR, Role.ADMIN, Role.SUPER_ADMIN));

router.get("/profile", MemberController.getMyProfile);
router.get("/purchased-ideas", MemberController.getMyPurchasedIdeas);
router.get("/followers", MemberController.getMyFollowers);
router.get("/following", MemberController.getMyFollowing);
router.get("/reviews", MemberController.getMyReviews);
router.get("/invoice/:paymentId", MemberController.getInvoice);

// Admin-only routes
router.get("/", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), MemberController.getAllMembers);

export const MemberRoutes = router;
