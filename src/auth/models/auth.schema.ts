import { prop, pre, index } from "@typegoose/typegoose";
import bcrypt from "bcryptjs";

@pre<User>("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
})
export class User {
  @prop({ required: true, sparse: true })
  full_name: string;

  @prop({ required: true, unique: true, sparse: true })
  email: string;

  @prop({ required: true, unique: true, sparse: true })
  phoneNumber: string;

  @prop({ required: true })
  password: string;

  @prop({ default: false })
  isVerified: boolean;

  @prop({ unique: true, sparse: true })
  stripeCustomerId?: string;

  comparePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password ?? "");
  }
}

@index({ expiresAt: 1 }, { expireAfterSeconds: 0 })
@index({ email: 1 }, { unique: true, sparse: true })
export class OTP {
  @prop({ required: true })
  email: string;

  @prop({ required: true })
  otpCode: string;

  @prop({ default: () => new Date(Date.now() + 5 * 60 * 1000) }) // OTP expires in 5 minutes
  expiresAt: Date;
}
