import { getModelForClass } from "@typegoose/typegoose";
import { FollowUp } from "./followUp.schema";

export const FollowUpModel = getModelForClass(FollowUp, {
  schemaOptions: { timestamps: true },
});
