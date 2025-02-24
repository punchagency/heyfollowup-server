import { IsBoolean, IsString } from "class-validator";

export class PaymentDto {
  @IsString()
  paymentMethodId: string;

  @IsBoolean()
  saveCard: boolean;
}
