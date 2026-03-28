import z from "zod";

export const loginZodSchema = z.object({
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
})

export const registerZodSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters long"),
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters long")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/[@$!%*?&]/, "Password must contain at least one special character"),
    isModerator: z.boolean().optional(),
    profileData: z.object({
        profilePhoto: z.string().url().optional(),
        contactNumber: z.string().min(7).optional(),
        bio: z.string().max(1000).optional(),
        address: z.string().max(300).optional(),
        phoneNumber: z.string().min(10).optional(),
        reputationScore: z.number().min(0).optional(),
        socialLinks: z.object({
            twitter: z.string().url().optional(),
            github: z.string().url().optional(),
            linkedin: z.string().url().optional(),
            website: z.string().url().optional(),
        }).optional(),
        assignNotes: z.string().max(1000).optional(),
    }).optional(),
}).refine((data) => {
    if (data.isModerator) {
        return !!data.profileData;
    }
    return true;
}, {
    message: "profileData is required when isModerator is true",
    path: ["profileData"],
});
