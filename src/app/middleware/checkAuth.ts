/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import status from "http-status";
import { Role, UserStatus } from "../../generated/prisma/enums";
import { envVars } from "../config/env";
import AppError from "../errorHelpers/AppError";
import { prisma } from "../lib/prisma";
import { CookieUtils } from "../utils/cookie";
import { jwtUtils } from "../utils/jwt";

/**
 * Middleware to check authentication and authorization (RBAC)
 * Supports both Session (Better-Auth) and JWT Access Token authentication.
 * 
 * @param authRoles - Array of roles allowed to access the route. If empty, all authenticated users are allowed.
 * Note: Role.SUPER_ADMIN always has access if role checking is active.
 */
export const checkAuth = (...authRoles: Role[]) => async (req: Request, res: Response, next: NextFunction) => {
    try {
        const sessionToken = CookieUtils.getCookie(req, "better-auth.session_token");
        const accessToken = CookieUtils.getCookie(req, 'accessToken');

        let user: any = null;

        // 1. Preferred Authentication: Session Token (Better-Auth)
        if (sessionToken) {
            const sessionData = await prisma.session.findFirst({
                where: {
                    token: sessionToken,
                    expiresAt: {
                        gt: new Date(),
                    }
                },
                include: {
                    user: true,
                }
            });

            if (sessionData && sessionData.user) {
                user = sessionData.user;

                // Session Refresh Logic
                const now = new Date();
                const expiresAt = new Date(sessionData.expiresAt);
                const createdAt = new Date(sessionData.createdAt);

                const sessionLifeTime = expiresAt.getTime() - createdAt.getTime();
                const timeRemaining = expiresAt.getTime() - now.getTime();
                const percentRemaining = (timeRemaining / sessionLifeTime) * 100;

                if (percentRemaining < 20) {
                    res.setHeader('X-Session-Refresh', 'true');
                    res.setHeader('X-Session-Expires-At', expiresAt.toISOString());
                    console.log("Session expiring soon - marking for refresh");
                }
            }
        }

        // 2. Fallback Authentication: Access Token (JWT)
        if (!user && accessToken) {
            const verifiedToken = jwtUtils.verifyToken(accessToken, envVars.ACCESS_TOKEN_SECRET);

            if (verifiedToken.success && verifiedToken.data) {
                // Fetch fresh user data from DB to ensure state is current (status/roles)
                const userId = (verifiedToken.data as any).userId || (verifiedToken.data as any).id;

                if (userId) {
                    user = await prisma.user.findUnique({
                        where: { id: userId }
                    });
                }
            }
        }

        // If no user found via any method, unauthorized
        if (!user) {
            throw new AppError(status.UNAUTHORIZED, 'Unauthorized access! Please log in to continue.');
        }

        // 3. Common Security Checks
        if (user.status === UserStatus.BLOCKED || user.status === UserStatus.DELETED || user.isDeleted) {
            throw new AppError(status.UNAUTHORIZED, 'Unauthorized access! Your account is not active.');
        }

        // 4. Role Authorization (RBAC)
        if (authRoles.length > 0) {
            // Check if user role is in the authorized list
            // Super Admin bypasses all specific role requirements
            const isAuthorized = authRoles.includes(user.role) || user.role === Role.SUPER_ADMIN;

            if (!isAuthorized) {
                throw new AppError(status.FORBIDDEN, 'Forbidden access! You do not have permission to access this resource.');
            }
        }

        // 5. Attach user info to request object
        req.user = {
            userId: user.id,
            role: user.role,
            email: user.email,
        };

        next();
    } catch (error: any) {
        next(error);
    }
};