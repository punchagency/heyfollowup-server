import express from "express";
import { Container } from "typedi";
import { AuthController } from "../controllers/auth.controller";
import { authenticate } from "../../common/middlewares/auth.middleware";

const authRouter = express.Router();
const authController = Container.get(AuthController);

authRouter.post("/signup", authController.signup.bind(authController));
authRouter.post("/signin", authController.signin.bind(authController));
authRouter.post("/signout", authController.signout.bind(authController));
authRouter.post("/verify-otp", authController.verifyOTP.bind(authController));
authRouter.post("/send-otp", authController.sendOTP.bind(authController));
authRouter.post(
  "/refresh",
  authController.refreshAccessToken.bind(authController)
);
authRouter.post(
  "/forgot-password",
  authController.forgotPassword.bind(authController)
);
authRouter.patch(
  "/change-password",
  authenticate,
  authController.changePassword.bind(authController)
);
authRouter.patch(
  "/reset-password",
  authController.resetPassword.bind(authController)
);
authRouter.get(
  "/profile",
  authenticate,
  authController.getProfile.bind(authController)
);
// authRouter.get("/", authController.getAll.bind(authController));

export default authRouter;
