import { IsBoolean, IsEnum, IsString } from "class-validator";

export class PaymentDto {
  @IsString()
  paymentMethodId: string;

  @IsBoolean()
  saveCard: boolean;

  @IsString()
  @IsEnum(["monthly", "yearly"], {
    message: "Invalid plan option",
  })
  plan: string;
}
