import { prop, Ref } from "@typegoose/typegoose";
import { User } from "../../auth/models/auth.schema";

export class Payment {
  @prop({ required: true, ref: () => User })
  userId: Ref<User>;

  @prop({ required: true })
  amount: number;

  @prop({ required: true })
  currency: string;

  @prop({ required: true, enum: ["succeeded", "pending", "failed"] })
  status: string;

  @prop({ required: true, enum: ["monthly", "yearly"] })
  plan: string; // Added plan field

  @prop({ required: true })
  stripePaymentIntentId: string;
}

export class SavedPaymentMethod {
  @prop({ required: true, ref: () => User })
  userId: Ref<User>;

  @prop({ required: true })
  stripePaymentMethodId: string;

  @prop({ required: true })
  brand: string;

  @prop({ required: true })
  last4: string;

  @prop({ required: true })
  expMonth: number;

  @prop({ required: true })
  expYear: number;
}
