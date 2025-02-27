import "reflect-metadata";
import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/mongodb-config";
import { errorMiddleware } from "./common/middlewares/error.middleware";
import { env } from "./config/env";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRouter from "./auth/routes/auth.routes";
import followUpRouter from "./followUp/routes/followUp.routes";
import paymentRouter from "./payment/routes/payment.route";
import apiLimiter from "./common/middlewares/rate-limit.middleware";
import bodyParser from "body-parser";

dotenv.config();

const app = express();
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());
app.use(
  cors()
  // { origin: "http://localhost:3000", credentials: true }
);
app.use(apiLimiter);
app.use(express.json());

connectDB();

app.use("/api/auth", authRouter);
app.use("/api/follow-up", followUpRouter);
app.use("/api/payment", paymentRouter);

app.use(errorMiddleware);

const PORT = process.env.PORT || env.server_port; // Use Heroku's port or fallback to env config

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
