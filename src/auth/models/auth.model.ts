import { getModelForClass } from "@typegoose/typegoose";
import { OTP, User } from "./auth.schema";

export const UserModel = getModelForClass(User, {
  schemaOptions: { timestamps: true },
});
export const OTPModel = getModelForClass(OTP, {
  schemaOptions: { timestamps: true },
});
