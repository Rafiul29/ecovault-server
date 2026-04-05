import { z } from "zod";

const handleJsonString = (val: unknown) => {
  if (typeof val === "string") {
    try {
      return JSON.parse(val);
    } catch {
      return val;
    }
  }
  return val;
};

export const updateModeratorZodSchema = z.object({
  name: z.string().optional(),
  image: z.string().optional(),
  profilePhoto: z.string().url().optional(),
  contactNumber: z.string().optional(),
  bio: z.string().optional(),
  address: z.string().optional(),
  phoneNumber: z.string().optional(),
  socialLinks: z.preprocess(handleJsonString, z.record(z.string(), z.string()).optional()),
});
