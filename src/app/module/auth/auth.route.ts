import { Router } from "express";
import { AuthController } from "./auth.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { validateRequest } from "../../middleware/validateRequest";
import { loginZodSchema, registerZodSchema } from "./auth.validator";

const router = Router();

router.post("/register", validateRequest(registerZodSchema), AuthController.register);

router.post("/login", validateRequest(loginZodSchema), AuthController.loginUser);
router.get("/me", checkAuth(Role.ADMIN, Role.MODERATOR, Role.MEMBER, Role.SUPER_ADMIN), AuthController.getMe)
router.post("/refresh-token", AuthController.getNewToken);
router.post("/change-password", checkAuth(Role.ADMIN, Role.MODERATOR, Role.MEMBER, Role.SUPER_ADMIN), AuthController.changePassword)
router.post("/logout", checkAuth(Role.ADMIN, Role.MODERATOR, Role.MEMBER, Role.SUPER_ADMIN), AuthController.logoutUser)

router.post("/verify-email", AuthController.verifyEmail)
router.post("/forget-password", AuthController.forgetPassword)
router.post("/reset-password", AuthController.resetPassword)

router.get("/login/google", AuthController.googleLogin);
router.get("/google/success", AuthController.googleLoginSuccess);
router.get("/oauth/error", AuthController.handleOAuthError);

export const AuthRoutes:Router = router;
