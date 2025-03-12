import { getModelForClass } from "@typegoose/typegoose";
import { FollowUp, FollowUpMessage } from "./followUp.schema";

export const FollowUpModel = getModelForClass(FollowUp, {
  schemaOptions: { timestamps: true },
});

export const FollowUpMessageModel = getModelForClass(FollowUpMessage, {
  schemaOptions: { timestamps: true },
});
