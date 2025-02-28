import { prop, Ref } from "@typegoose/typegoose";
import { User } from "../../auth/models/auth.schema";

export class FollowUp {
  @prop({ required: true, ref: () => User })
  userId: Ref<User>;

  @prop({ required: true })
  name: string;

  @prop({ required: false })
  date?: Date;

  @prop({ required: true })
  metWith: string;

  @prop({
    required: true,
    unique: false,
    // sparse: true,
  })
  email: string;

  @prop({ required: false })
  meetingLocation?: string;

  @prop()
  randomFacts?: string;

  @prop()
  linkedinUrl?: string;

  @prop({
    enum: [
      "Ignore",
      "Connect Them To Someone",
      "Catch Up",
      "Schedule Follow Up",
      "Send Them Info",
    ],
  })
  nextSteps?: string;

  @prop({
    required: true,
    enum: ["Follow Up Now", "Follow Up Later"],
  })
  schedule: string;

  @prop()
  followUpDays?: number;

  @prop({
    required: false,
    unique: false,
    // sparse: true,
  })
  phoneNumber?: string;

  @prop()
  image: string;
}
