import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { bearer, emailOTP } from "better-auth/plugins";
import { Role, UserStatus } from "../../generated/prisma/enums";
import { envVars } from "../config/env";
import { sendEmail } from "../utils/email";
import { prisma } from "./prisma";

const connectionString = process.env.DATABASE_URL;

type OptVerification = {
    email: string;
    otp: string;
    type: "email-verification" | "forget-password";
    user?: {
        id: string;
        name: string;
        email: string;
        role: Role;
        status: UserStatus;
        needPasswordChange: boolean;
        emailVerified: boolean;
        isDeleted: boolean;
        deletedAt: Date | null;
    }
};
export const auth = betterAuth({
    baseURL: envVars.BETTER_AUTH_URL,
    secret: envVars.BETTER_AUTH_SECRET,
    database: prismaAdapter(prisma, {
        provider: "postgresql", // or "mysql", "postgresql", ...etc
    }),

    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
    },

    socialProviders: {
        google: {
            clientId: envVars.GOOGLE_CLIENT_ID,
            clientSecret: envVars.GOOGLE_CLIENT_SECRET,
            // callbackUrl: envVars.GOOGLE_CALLBACK_URL,
            mapProfileToUser: () => {
                return {
                    role: Role.MEMBER,
                    status: UserStatus.ACTIVE,
                    needPasswordChange: false,
                    emailVerified: true,
                    isDeleted: false,
                    deletedAt: null,
                }
            }
        }
    },

    emailVerification: {
        sendOnSignUp: true,
        sendOnSignIn: true,
        autoSignInAfterVerification: true,
    },

    user: {
        additionalFields: {
            role: {
                type: "string",
                required: true,
                defaultValue: Role.MEMBER
            },
            status: {
                type: "string",
                required: true,
                defaultValue: UserStatus.ACTIVE
            },
            needPasswordChange: {
                type: "boolean",
                required: true,
                defaultValue: false
            },

            isDeleted: {
                type: "boolean",
                required: true,
                defaultValue: false
            },

            deletedAt: {
                type: "date",
                required: false,
                defaultValue: null
            },
        }
    },

    plugins: [
        bearer(),
        emailOTP({
            overrideDefaultEmailVerification: true,
            async sendVerificationOTP({ email, otp, type, user }) {
                // Note: Better Auth often passes the user object directly in the callback args

                // 1. If user isn't passed in args, fetch it, but don't be too restrictive
                const dbUser = user || await prisma.user.findUnique({ where: { email } });

                if (!dbUser) {
                    console.error(`User ${email} not found.`);
                    return;
                }

                // 2. Skip for Super Admins as per your logic
                if (dbUser.role === Role.SUPER_ADMIN) return;

                if (type === "email-verification") {
                    await sendEmail({
                        to: email,
                        subject: "Verify your email",
                        templateName: "otp",
                        templateData: {
                            name: dbUser.name,
                            otp,
                        }
                    });
                } else if (type === "forget-password") {
                    await sendEmail({
                        to: email,
                        subject: "Password Reset OTP",
                        templateName: "otp",
                        templateData: {
                            name: dbUser.name,
                            otp,
                        }
                    });
                }
            },
            expiresIn: 120, // 2 minutes
            otpLength: 6,
        })
        // emailOTP({
        //     overrideDefaultEmailVerification: true,
        //     async sendVerificationOTP({ email, otp, type }) {
        //         if (type === "email-verification") {
        //             const user = await prisma.user.findUnique({
        //                 where: {
        //                     email,
        //                 }
        //             })

        //             if (!user) {
        //                 console.error(`User with email ${email} not found. Cannot send verification OTP.`);
        //                 return;
        //             }

        //             if (user && user.role === Role.SUPER_ADMIN) {
        //                 console.log(`User with email ${email} is a super admin. Skipping sending verification OTP.`);
        //                 return;
        //             }

        //             if (user && !user.emailVerified) {
        //                 sendEmail({
        //                     to: email,
        //                     subject: "Verify your email",
        //                     templateName: "otp",
        //                     templateData: {
        //                         name: user.name,
        //                         otp,
        //                     }
        //                 })
        //             }
        //         } else if (type === "forget-password") {
        //             const user = await prisma.user.findUnique({
        //                 where: {
        //                     email,
        //                 }
        //             })

        //             if (user) {
        //                 sendEmail({
        //                     to: email,
        //                     subject: "Password Reset OTP",
        //                     templateName: "otp",
        //                     templateData: {
        //                         name: user.name,
        //                         otp,
        //                     }
        //                 })
        //             }
        //         }
        //     },
        //     expiresIn: 2 * 60, // 2 minutes in seconds
        //     otpLength: 6,
        // })
    ],

    session: {
        expiresIn: 60 * 60 * 60 * 24, // 1 day in seconds
        updateAge: 60 * 60 * 60 * 24, // 1 day in seconds
        cookieCache: {
            enabled: true,
            maxAge: 60 * 60 * 60 * 24, // 1 day in seconds
        }
    },

    redirectURLs: {
        signIn: `${envVars.BETTER_AUTH_URL}/api/v1/auth/google/success`,
    },

    trustedOrigins: [process.env.BETTER_AUTH_URL || "https://ecovault-server.vercel.app", "http://localhost:5000", "https://ecovault-client.vercel.app", envVars.FRONTEND_URL],


    advanced: {
        disableCSRFCheck: true,
        cookiePrefix: "better-auth",
        useSecureCookies: false,
        crossSubDomainCookies: {
            enabled: false,
        },
        cookies: {
            state: {
                attributes: {
                    sameSite: "none",
                    secure: true,
                    httpOnly: true,
                    path: "/",
                }
            },
            sessionToken: {
                attributes: {
                    sameSite: "none",
                    secure: true,
                    httpOnly: true,
                    path: "/",
                }
            }
        }
    }

});
