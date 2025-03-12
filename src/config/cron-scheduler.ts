import cron from "node-cron";
import { FollowUpModel } from "../followUp/models/followUp.model";
import mongoose from "mongoose";
import { UserModel } from "../auth/models/auth.model";
import { sendPushNotifications } from "./firebase";

// Schedule job to run at 12 AM every day
cron.schedule(
  "27 12 * * *",
  async () => {
    console.log("Running scheduled task...");

    const now = new Date();
    const followUps = (await FollowUpModel.find({
      followUpDays: { $type: "number" },
    }).lean()) as unknown as Array<{
      _id: mongoose.Types.ObjectId;
      createdAt: Date;
      followUpDays?: number;
      userId: string;
      metWith: string;
    }>;

    console.log({ followUps });

    followUps.forEach(async (followUp) => {
      if (followUp.followUpDays === null || followUp.followUpDays === undefined)
        return;

      const elapsedDays = Math.floor(
        (now.getTime() - followUp.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      );
      console.log({ elapsedDays, followUpDays: followUp.followUpDays });

      if (elapsedDays >= followUp.followUpDays) {
        const user = await UserModel.findById(followUp.userId);
        if (!user) throw new Error("User not found");

        const metWith = followUp.metWith;
        const message = `Hey! Today is your scheduled follow-up with ${metWith}. Remember to follow up on the HeyFollowUp app.`;

        if (user.deviceTokens?.length) {
          await sendPushNotifications(user.deviceTokens, message);
        }

        await FollowUpModel.findByIdAndUpdate(followUp._id, {
          followUpDays: null, // or -1 to indicate no future reminders
        });
      }
    });
  },
  {
    timezone: "Europe/Berlin",
    // timezone: "America/New_York"
  }
);
