import express, { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { WatchlistController } from "./watchlist.controller";
import { watchlistZodSchema } from "./watchlist.validator";

const router = express.Router();

router.post(
  "/",
  checkAuth(Role.MEMBER, Role.MODERATOR, Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(watchlistZodSchema),
  WatchlistController.toggleWatchlist
);

router.get(
  "/me",
  checkAuth(Role.MEMBER, Role.MODERATOR, Role.ADMIN, Role.SUPER_ADMIN),
  WatchlistController.getMyWatchlist
);

export const WatchlistRoutes: Router = router;
