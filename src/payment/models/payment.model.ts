import { getModelForClass } from "@typegoose/typegoose";
import { Payment, SavedPaymentMethod } from "./payment.schema";

export const PaymentModel = getModelForClass(Payment, {
  schemaOptions: { timestamps: true },
});

export const SavedPaymentMethodModel = getModelForClass(SavedPaymentMethod, {
  schemaOptions: { timestamps: true },
});
