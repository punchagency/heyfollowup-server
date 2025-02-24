import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { validateOrReject } from "class-validator";
import { Service } from "typedi";
import {
  ChangePassowordDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  SendOTPDto,
  SigninDto,
  SignupDto,
  VerifyOtpDto,
} from "../dtos/auth.dto";
import { AuthRequest } from "../../common/middlewares/auth.middleware";

@Service()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  async signup(req: Request, res: Response): Promise<void> {
    try {
      const data = Object.assign(new SignupDto(), req.body);
      await validateOrReject(data);
      const user = await this.authService.signup(data);
      res.status(201).json({
        success: true,
        message:
          "OTP sent to your email. Please verify to complete registration.",
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || error || "An unexpected error occurred",
      });
    }
  }

  async signin(req: Request, res: Response): Promise<void> {
    try {
      const data = Object.assign(new SigninDto(), req.body);
      await validateOrReject(data);
      const signInDetails = await this.authService.signin(data);
      res.cookie("refreshToken", signInDetails.refreshToken, {
        httpOnly: true, // Prevent JavaScript access
        secure: process.env.NODE_ENV === "production", // Ensures it works only over HTTPS
        sameSite: "strict", // Prevents CSRF attacks
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
      res.status(200).json({
        success: true,
        user: signInDetails.user,
        accessToken: signInDetails.accessToken,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || error || "An unexpected error occurred",
      });
    }
  }

  async signout(req: Request, res: Response): Promise<void> {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) throw new Error("No refresh token found");

      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
      });

      res
        .status(200)
        .json({ success: true, message: "Signed out successfully" });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || error || "An unexpected error occurred",
      });
    }
  }

  async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const data = Object.assign(new ForgotPasswordDto(), req.body);
      await validateOrReject(data);
      await this.authService.forgotPassword(data);
      res.status(200).json({
        success: true,
        message: "OTP sent to email. Please verify to complete password reset.",
      });
    } catch (error: any) {
      console.log({ err: error });
      res.status(400).json({
        success: false,
        error: error.message || error || "An unexpected error occurred",
      });
    }
  }

  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const data = Object.assign(new ResetPasswordDto(), req.body);
      await validateOrReject(data);
      await this.authService.resetPassword(data);
      res
        .status(200)
        .json({ success: true, message: "Password reset successfully" });
    } catch (error: any) {
      console.log({ error }, error.message);
      res.status(400).json({
        success: false,
        error: error.message || error || "An unexpected error occurred",
      });
    }
  }

  async changePassword(req: AuthRequest, res: Response): Promise<void> {
    try {
      const data = Object.assign(new ChangePassowordDto(), req.body);
      await validateOrReject(data);
      console.log("validated");
      console.log(req.user.id);
      await this.authService.changePassword(req.user.id, data);
      res.status(200).json({ success: true, message: "Password changed" });
    } catch (error: any) {
      console.log({ err: error });
      res.status(400).json({
        success: false,
        error: error.message || error || "An unexpected error occurred",
      });
    }
  }

  async sendOTP(req: Request, res: Response): Promise<void> {
    try {
      const data = Object.assign(new SendOTPDto(), req.body);
      await validateOrReject(data);
      const message = await this.authService.sendOTP(data);
      res.status(200).json({ success: true, message });
    } catch (error: any) {
      res.status(403).json({
        success: false,
        error: error.message || error || "An unexpected error occurred",
      });
    }
  }

  async verifyOTP(req: Request, res: Response): Promise<void> {
    try {
      const data = Object.assign(new VerifyOtpDto(), req.body);
      await validateOrReject(data);
      const user = await this.authService.verifyOTP(data);
      res.status(201).json({ success: true, user });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || error || "An unexpected error occurred",
      });
    }
  }

  async refreshAccessToken(req: Request, res: Response): Promise<void> {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) throw new Error("Invalid or expired refresh token");
      const newAccessToken = await this.authService.refreshAccessToken(
        refreshToken
      );
      res.status(200).json({ success: true, accessToken: newAccessToken });
    } catch (error: any) {
      res.status(403).json({
        success: false,
        error: error.message || error || "An unexpected error occurred",
      });
    }
  }

  async getProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = await this.authService.getProfile(req.user.id);
      res.status(200).json({ success: true, user });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || error || "An unexpected error occurred",
      });
    }
  }

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const users = await this.authService.getAll();
      res.status(200).json({ success: true, users });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || "An unexpected error occurred",
      });
    }
  }
}
