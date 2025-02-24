import "reflect-metadata";
import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/mongodb-config";
import { env } from "./config/env";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRouter from "./auth/routes/auth.routes";
import followUpRouter from "./followUp/routes/followUp.routes";

dotenv.config();

const app = express();
app.use(cookieParser());
app.use(
  cors()
  // { origin: "http://localhost:3000", credentials: true }
);
app.use(express.json());

connectDB();

app.use("/api/auth", authRouter);
app.use("/api/follow-up", followUpRouter);

app.listen(env.server_port, () => {
  console.log(`Server running on http://localhost:${env.server_port}`);
});
