import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  IsDate,
  IsArray,
  IsPhoneNumber,
  IsNumber,
} from "class-validator";
import { Type } from "class-transformer";

export class FollowUpDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  date?: string;

  @IsString()
  metWith: string;

  @IsEmail({}, { message: "Invalid email format" })
  email: string;

  @IsOptional()
  @IsString()
  meetingLocation?: string;

  @IsOptional()
  @IsString()
  randomFacts?: string;

  @IsOptional()
  @IsString()
  linkedinUrl?: string;

  @IsOptional()
  @IsString()
  @IsEnum(
    [
      "Ignore",
      "Connect Them To Someone",
      "Catch Up",
      "Schedule Follow Up",
      "Send Them Info",
    ],
    { message: "Invalid next steps option" }
  )
  nextSteps?: string;

  @IsString()
  @IsEnum(["Follow Up Now", "Follow Up Later"], {
    message: "Invalid schedule option",
  })
  schedule: string;

  @IsOptional()
  @IsNumber()
  followUpDays?: number;

  @IsOptional()
  @IsPhoneNumber(undefined, { message: "Invalid phone number format" })
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  image?: string;
}

export class UpdateFollowUpDto {
  constructor(init?: Partial<FollowUpDto>) {
    Object.assign(this, init);
  }
}
