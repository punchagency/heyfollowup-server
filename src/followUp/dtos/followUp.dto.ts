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
  @IsDate()
  @Type(() => Date)
  date?: Date;

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
  @IsArray()
  @IsEnum(
    [
      "Ignore",
      "Connect Them To Someone",
      "Catch Up",
      "Schedule Follow Up",
      "Send Them Info",
    ],
    { each: true }
  )
  nextSteps?: string[];

  @IsOptional()
  @IsString()
  @IsEnum(["Follow Up Now", "Follow Up Later"], {
    message: "Invalid schedule option",
  })
  schedule?: string;

  @IsOptional()
  @IsNumber()
  followUpDays?: number;

  @IsOptional()
  @IsPhoneNumber(undefined, { message: "Invalid phone number format" })
  phoneNumber?: string;
}
