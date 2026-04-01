import express, { Application, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./app/lib/auth";
import path from "path";
import qs from "qs";
import { IndexRoutes } from "./app/routes";
import { notFound } from "./app/middleware/notFound";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import { PaymentController } from "./app/module/payment/payment.controller";
import { envVars } from "./app/config/env";

const app: Application = express();

app.set('query parser', (str: string) => qs.parse(str));
app.set("view engine", 'ejs')
app.set("views", path.resolve(process.cwd(), `src/app/templates`))


const allowedOrigins: string[] = [
  "http://localhost:3000",
  envVars.FRONTEND_URL, "https://ecovault-client.vercel.app", "http://localhost:3000"
].filter(Boolean);


app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);

      // Check if origin is in allowedOrigins or matches Vercel preview pattern
      const isAllowed =
        allowedOrigins.includes(origin) ||
        /^https:\/\/.*\.vercel\.app$/.test(origin);

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposedHeaders: ["Set-Cookie"],
  }),
);


app.use("/api/auth", toNodeHandler(auth))

app.post("/webhook", express.raw({ type: "application/json" }), PaymentController.handleStripeWebhookEvent)


app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.get("/", async (req: Request, res: Response) => {
  res.status(201).json({
    success: true,
    message: "API is working",
  });
});

app.use("/api/v1", IndexRoutes);

app.use(globalErrorHandler)
app.use(notFound)

export default app;
