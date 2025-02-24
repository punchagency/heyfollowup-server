import { prop, Ref } from "@typegoose/typegoose";
import { User } from "../../auth/models/auth.schema";

export class Payment {
  @prop({ required: true, ref: () => User })
  userId: Ref<User>;

  @prop({ required: true })
  amount: number;

  @prop({ required: true })
  currency: string;

  @prop({ required: true })
  stripePaymentIntentId: string;

  @prop({ required: true, enum: ["succeeded", "pending", "failed"] })
  status: string;
}

export class SavedPaymentMethod {
  @prop({ required: true, ref: () => User })
  userId: Ref<User>;

  @prop({ required: true })
  stripePaymentMethodId: string; // Store Stripe's tokenized PaymentMethod ID

  @prop({ required: true })
  brand: string; // e.g., Visa, MasterCard

  @prop({ required: true })
  last4: string; // Last 4 digits of the card

  @prop({ required: true })
  expMonth: number;

  @prop({ required: true })
  expYear: number;
}
