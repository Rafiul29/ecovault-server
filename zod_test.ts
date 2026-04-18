import { z } from "zod";

enum UserStatus {
  ACTIVE = "ACTIVE",
  BLOCKED = "BLOCKED",
  DELETED = "DELETED"
}

export const changeUserStatusZodSchema = z.object({
    userId: z.string(),
    status: z.enum([UserStatus.ACTIVE, UserStatus.BLOCKED, UserStatus.DELETED]),
});

const reqBody = { userId: 'HcZr3bz81f9oMD5T1UNyidpVKXraS3Pw', userStatus: 'BLOCKED' };
const parsedResult = changeUserStatusZodSchema.safeParse(reqBody);
console.log(JSON.stringify(parsedResult));
