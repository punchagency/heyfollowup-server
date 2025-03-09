import { Service } from "typedi";
import { FollowUpDto, UpdateFollowUpDto } from "../dtos/followUp.dto";
import { FollowUpModel } from "../models/followUp.model";
import { generateFollowUpMessage } from "../../common/utils/openAi.util";
import mongoose from "mongoose";
import { UserModel } from "../../auth/models/auth.model";

@Service()
export class FollowUpService {
  async createFollowUp(userId: string, data: FollowUpDto) {
    try {
      const user = await UserModel.findById(userId);
      if (!user) throw new Error("User not found");

      // Check if the user is currently subscribed
      const isSubscribed = user.subscriptionExpiresAt > new Date();

      // Count user's follow-ups
      const followUpCount = await FollowUpModel.countDocuments({ userId });

      if (!isSubscribed && followUpCount >= 2) {
        // Get the latest two follow-ups
        const latestTwoFollowUps = await FollowUpModel.find({ userId })
          .sort({ createdAt: -1 }) // Sort by newest first
          .limit(2);

        // If both were created after subscription expired, deny new follow-up creation
        if (
          latestTwoFollowUps.length === 2 &&
          latestTwoFollowUps.every(
            (f) =>
              new Date((f as any).createdAt) >
              new Date(user.subscriptionExpiresAt)
          )
        ) {
          throw new Error(
            "Users can only create 2 free follow-ups without a subscription."
          );
        }
      }

      let message: string | null = "";

      if (data.schedule === "Follow Up Now") {
        message = await generateFollowUpMessage(data);
      }
      const followUp = await FollowUpModel.create({ ...data, userId });

      return { followUp, message };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to create follow-up: ${error.message}`);
      } else {
        throw new Error(
          "Failed to create follow-up: An unknown error occurred"
        );
      }
    }
  }

  async getFollowUps(userId: string) {
    try {
      const followUps = await FollowUpModel.find({ userId });
      return followUps;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch follow-ups: ${error.message}`);
      } else {
        throw new Error(
          "Failed to fetch follow-ups: An unknown error occurred"
        );
      }
    }
  }

  async getFollowUpById(userId: string, followUpId: string) {
    try {
      if (!mongoose.Types.ObjectId.isValid(followUpId)) {
        throw new Error("Invalid mongodb ID");
      }
      const followUp = await FollowUpModel.findOne({ userId, _id: followUpId });
      if (!followUp) throw new Error("Follow-up not found or unauthorized");
      return followUp;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch follow-up: ${error.message}`);
      } else {
        throw new Error("Failed to fetch follow-up: An unknown error occurred");
      }
    }
  }

  async generateFollowUpMessage(userId: string, followUpId: string) {
    try {
      if (!mongoose.Types.ObjectId.isValid(followUpId)) {
        throw new Error("Invalid mongodb ID");
      }
      const followUp = await FollowUpModel.findOne({ _id: followUpId, userId });
      if (!followUp) throw new Error("Follow-up not found or unauthorized");

      const newMessage = await generateFollowUpMessage(followUp);

      return { newMessage };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to generate follow-up: ${error.message}`);
      } else {
        throw new Error(
          "Failed to generate follow-up: An unknown error occurred"
        );
      }
    }
  }

  async updateFollowUp(
    userId: string,
    followUpId: string,
    data: UpdateFollowUpDto
  ) {
    try {
      if (!mongoose.Types.ObjectId.isValid(followUpId)) {
        throw new Error("Invalid mongodb ID");
      }

      const updatedFollowUp = await FollowUpModel.findByIdAndUpdate(
        { _id: followUpId, userId },
        data,
        { new: true, runValidators: true }
      );
      if (!updatedFollowUp)
        throw new Error("Follow-up not found or unauthorized");

      return { updatedFollowUp };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to update follow-up: ${error.message}`);
      } else {
        throw new Error(
          "Failed to update follow-up: An unknown error occurred"
        );
      }
    }
  }

  // async deleteFollowUp(userId: string, followUpId: string) {
  //   try {
  //     const result = await FollowUpModel.findByIdAndDelete({
  //       _id: followUpId,
  //       userId,
  //     });
  //     if (!result) throw new Error("Follow-up not found or unauthorized");
  //     return { result, message: "Follow-up deleted successfully" };
  //   } catch (error) {
  //     if (error instanceof Error) {
  //       throw new Error(`Failed to delete follow-up: ${error.message}`);
  //     } else {
  //       throw new Error(
  //         "Failed to delete follow-up: An unknown error occurred"
  //       );
  //     }
  //   }
  // }
}
