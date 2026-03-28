import { z } from "zod";

export const updateModeratorZodSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    profilePhoto: z.string().url().optional(),
    contactNumber: z.string().optional(),
    bio: z.string().optional(),
    address: z.string().optional(),
    phoneNumber: z.string().optional(),
    socialLinks: z.record(z.string(), z.string()).optional(),
  }),
});
