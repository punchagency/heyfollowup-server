import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsPhoneNumber,
  IsString,
  IsEnum,
  IsOptional,
} from "class-validator";

export class SignupDto {
  @IsString()
  full_name: string;

  @IsEmail({}, { message: "Invalid email format" })
  email: string;

  @IsOptional()
  @IsPhoneNumber(undefined, { message: "Invalid phone number format" })
  phoneNumber?: string;

  @IsNotEmpty({ message: "Password cannot be empty" })
  password: string;
}

export class SigninDto {
  @IsEmail({}, { message: "Invalid email format" })
  email: string;

  @IsNotEmpty({ message: "Password is required for email-based login" })
  password: string;
}

export class SendOTPDto {
  @IsEmail({}, { message: "Invalid email format" })
  email: string;

  @IsNotEmpty({ message: "Context is required" })
  @IsString()
  @IsEnum(["forgot-password", "signup"], {
    message: "Invalid context option",
  })
  context: string;
}

export class ChangePassowordDto {
  @IsEmail({}, { message: "Invalid email format" })
  email: string;

  @MinLength(6, { message: "Password must be at least 6 characters long" })
  newPassword: string;

  @MinLength(6, { message: "Password must be at least 6 characters long" })
  oldPassword: string;
}

export class ResetPasswordDto {
  @IsEmail({}, { message: "Invalid email format" })
  email: string;

  @MinLength(6, { message: "Password must be at least 6 characters long" })
  newPassword: string;
}

export class ForgotPasswordDto {
  @IsEmail({}, { message: "Invalid email format" })
  email: string;
}

export class VerifyOtpDto {
  @IsEmail({}, { message: "Invalid email format" })
  email: string;

  @IsNotEmpty({ message: "OTP code is required" })
  otpCode: string;

  @IsNotEmpty({ message: "Context is required" })
  @IsString()
  @IsEnum(["forgot-password", "signup"], {
    message: "Invalid context option",
  })
  context: string;
}
