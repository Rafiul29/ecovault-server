import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { AdminController } from "./admin.controller";
import { updateAdminZodSchema } from "./admin.validation";
import { multerUpload } from "@/app/config/multer.config";

const router = Router();

router.get("/",
    checkAuth(Role.SUPER_ADMIN),
    AdminController.getAllAdmins);
router.get("/:id",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    AdminController.getAdminById);

// Public route to fetch a unified user profile by ID
router.get("/public-profile/:id",
    AdminController.getPublicProfileByUserId);


router.patch("/:id",
    checkAuth(Role.SUPER_ADMIN),
    multerUpload.single('file'),
    validateRequest(updateAdminZodSchema), AdminController.updateAdmin);

router.delete("/:id",
    checkAuth(Role.SUPER_ADMIN),
    AdminController.deleteAdmin);

router.patch("/change-user-status",
    checkAuth(Role.SUPER_ADMIN, Role.ADMIN),
    AdminController.changeUserStatus);
router.patch("/change-user-role",
    checkAuth(Role.SUPER_ADMIN),
    AdminController.changeUserRole);

router.get("/users",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    AdminController.getAllUsers);

router.get("/users/:id",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    AdminController.getUserById);

router.delete("/users/:id",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    AdminController.deleteUserAccount);

export const AdminRoutes: Router = router;