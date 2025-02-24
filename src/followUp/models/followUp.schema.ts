import { prop, Ref } from "@typegoose/typegoose";
import { User } from "../../auth/models/auth.schema";

export class FollowUp {
  @prop({ required: true, ref: () => User })
  userId: Ref<User>;

  @prop({ required: true })
  name: string;

  @prop({ required: true })
  date?: Date;

  @prop({ required: true })
  metWith: string;

  @prop({ required: true, unique: true, sparse: true })
  email: string;

  @prop({ required: true })
  meetingLocation?: string;

  @prop()
  randomFacts?: string;

  @prop()
  linkedinUrl?: string;

  @prop({
    type: () => [String],
    enum: [
      "Ignore",
      "Connect Them To Someone",
      "Catch Up",
      "Schedule Follow Up",
      "Send Them Info",
    ],
  })
  nextSteps?: string[];

  @prop({
    required: false,
    enum: ["Follow Up Now", "Follow Up Later"],
  })
  schedule?: string;

  @prop()
  followUpDays?: number;

  @prop({ required: false, unique: true, sparse: true })
  phoneNumber?: string;
}
