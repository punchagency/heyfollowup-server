import { Service } from "typedi";
import jwt from "jsonwebtoken";
import {
  ChangePassowordDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  SendOTPDto,
  SigninDto,
  SignupDto,
  VerifyOtpDto,
} from "../dtos/auth.dto";
import { OTPModel, UserModel } from "../models/auth.model";
import { env } from "../../config/env";
import { generateOTP } from "../../common/utils/otp.util";
import mongoose from "mongoose";
import { stripe } from "../../config/stripe-config";
import { sendOTPEmail } from "../../common/utils/nodemailer.util";

@Service()
export class AuthService {
  async signup(data: SignupDto): Promise<string> {
    try {
      const existingUser = await UserModel.findOne({
        $or: [{ email: data.email }, { phoneNumber: data.phoneNumber }],
      });

      if (existingUser && existingUser.isVerified)
        throw new Error(
          "User already exists. Email or Phone Number already registered"
        );

      if (!existingUser) await UserModel.create(data);

      return await this.sendOTP({ email: data.email, context: "signup" });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Signup failed: ${error.message}`);
      } else {
        throw new Error("Signup failed: An unknown error occurred");
      }
    }
  }

  async signin(data: SigninDto): Promise<{
    accessToken: string;
    refreshToken: string;
    user: any;
  }> {
    try {
      const user = await UserModel.findOne({ email: data.email });
      if (!user) throw new Error("Invalid credentials");

      const isMatch = await user.comparePassword(data.password);
      if (!isMatch) throw new Error("Invalid credentials");

      if (user.isVerified === false) throw new Error("User not verified");

      return this.generateTokens(user);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Signin failed: ${error.message}`);
      } else {
        throw new Error("Signin failed: An unknown error occurred");
      }
    }
  }

  async forgotPassword(data: ForgotPasswordDto): Promise<string> {
    try {
      const user = await UserModel.findOne({
        email: data.email,
        isVerified: true,
      });
      if (!user) throw new Error("User not found");

      return await this.sendOTP({
        email: data.email,
        context: "forgot-password",
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`OTP generation failed: ${error.message}`);
      } else {
        throw new Error("OTP generation failed: An unknown error occurred");
      }
    }
  }

  async sendOTP(data: SendOTPDto): Promise<string> {
    const user = await UserModel.findOne({ email: data.email });
    if (data.context === "signup") {
      if (!user) throw new Error("User does not exist");
      if (user.isVerified) throw new Error("User is already verified");
    }
    if (data.context === "forgot-password") {
      if (!user) throw new Error("User does not exist");
      if (!user.isVerified) throw new Error("User is not registered yet");
    }

    await OTPModel.deleteMany({ email: data.email });
    const otpCode = generateOTP();
    await OTPModel.create({
      email: data.email,
      otpCode,
    });
    await sendOTPEmail(data.email, otpCode);
    return `OTP resent for ${data.context} successfully`;
  }

  async resetPassword(data: ResetPasswordDto): Promise<void> {
    try {
      const user = await UserModel.findOne({ email: data.email });
      if (!user) throw new Error("User not found");

      user.password = data.newPassword;
      await user.save();
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Password reset failed: ${error.message}`);
      } else {
        throw new Error("Password reset failed: An unknown error occurred");
      }
    }
  }

  async changePassword(
    userId: string,
    data: ChangePassowordDto
  ): Promise<void> {
    try {
      const user = await UserModel.findOne({
        _id: userId,
        email: data.email,
        isVerified: true,
      });

      if (!user) throw new Error("User not found or unauthorized");

      const isMatch = await user.comparePassword(data.oldPassword);
      if (!isMatch) throw new Error("Wrong password");

      user.password = data.newPassword;
      await user.save();
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Password change failed: ${error.message}`);
      } else {
        throw new Error("Password change failed: An unknown error occurred");
      }
    }
  }

  async verifyOTP(data: VerifyOtpDto): Promise<string> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const otpRecord = await OTPModel.findOne({
        email: data.email,
        otpCode: data.otpCode,
      }).session(session);

      if (!otpRecord || otpRecord.expiresAt < new Date()) {
        throw new Error("Invalid or expired OTP");
      }

      await OTPModel.deleteMany({ email: data.email }).session(session);

      if (data.context === "signup") {
        const user = await UserModel.findOne({ email: data.email }).session(
          session
        );
        if (!user) throw new Error("User details not found");

        const stripeCustomerId = await this.generateStripeId(
          user.email,
          user.full_name
        );

        await UserModel.findByIdAndUpdate(
          user._id,
          {
            $set: { isVerified: true, stripeCustomerId },
          },
          { new: true } // Return updated user and ensure session is used
        ).session(session);
      }

      await session.commitTransaction();
      session.endSession();
      return "OTP Verified successfully";
    } catch (error) {
      await session.abortTransaction();

      if (error instanceof Error) {
        throw new Error(`OTP verification failed: ${error.message}`);
      } else {
        throw new Error("OTP verification failed: An unknown error occurred");
      }
    } finally {
      session.endSession();
    }
  }

  async refreshAccessToken(refreshToken: string): Promise<string> {
    try {
      const decoded = jwt.verify(refreshToken, env.refreshSecret) as {
        id: string;
      };
      const user = await UserModel.findById(decoded.id);
      if (!user) throw new Error("User not found");

      return this.generateAccessToken(user);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Invalid or expired refresh token: ${error.message}`);
      } else {
        throw new Error(
          "Invalid or expired refresh token: An unknown error occurred"
        );
      }
    }
  }

  async getProfile(userId: string): Promise<any> {
    try {
      const user = await UserModel.findById(userId, { password: 0 }).lean();
      if (!user) throw new Error("User not found");

      return user;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to retrieve user: ${error.message}`);
      } else {
        throw new Error("Failed to retrieve user: An unknown error occurred");
      }
    }
  }

  private generateTokens(user: any): {
    accessToken: string;
    refreshToken: string;
    user: any;
  } {
    const accessToken = this.generateAccessToken(user);
    const refreshToken = jwt.sign({ id: user._id }, env.refreshSecret, {
      expiresIn: 604800,
    });

    const userObject = { ...user.toObject() };
    delete userObject.password;
    return { accessToken, refreshToken, user: userObject };
  }

  private generateAccessToken(user: any): string {
    return jwt.sign({ id: user._id, email: user.email }, env.jwtSecret, {
      expiresIn: 900,
    });
  }

  private async generateStripeId(email: string, name: string): Promise<string> {
    const customer = await stripe.customers.create({
      email,
      name,
    });

    return customer.id;
  }

  // async getAll() {
  //   try {
  //     // return await UserModel.find();
  //     const users = await UserModel.find({}, { password: 0 }).lean();
  //     return users;
  //   } catch (error) {
  //     if (error instanceof Error) {
  //       throw new Error(`Failed to retrieve users: ${error.message}`);
  //     } else {
  //       throw new Error("Failed to retrieve users: An unknown error occurred");
  //     }
  //   }
  // }
}
