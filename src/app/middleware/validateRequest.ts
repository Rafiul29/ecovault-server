import { NextFunction, Request, Response } from "express";
import z from "zod";

export const validateRequest = (zodSchema: z.ZodObject) => {
  return (req: Request, res: Response, next: NextFunction) => {

    // Log original req.body to see what's actually there
    console.log("Original req.body keys:", Object.keys(req.body || {}));

    const dataKey = Object.keys(req.body || {}).find(key => key.trim() === 'data');
    if (dataKey && req.body[dataKey]) {
      try {
        const parsedBody = JSON.parse(req.body[dataKey]);
        req.body = parsedBody;
        console.log("Successfully parsed 'data' field into req.body");
      } catch (error: any) {
        console.error("JSON.parse error in validateRequest:", error.message);
        // If it's not valid JSON, we might want to still try to use the raw body
      }
    }

    const parsedResult = zodSchema.safeParse(req.body);

    if (!parsedResult.success) {
      return next(parsedResult.error);
    }

    //sanitizing the data
    req.body = parsedResult.data;

    next();
  };
};


