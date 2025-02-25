import { Service } from "typedi";
import { FollowUpDto } from "../dtos/followUp.dto";
import { FollowUpModel } from "../models/followUp.model";
import { generateFollowUpMessage } from "../../common/utils/openAi.util";
import mongoose from "mongoose";

@Service()
export class FollowUpService {
  async createFollowUp(userId: string, data: FollowUpDto) {
    try {
      // const existingFollowUp = await FollowUpModel.findOne({
      //   $or: [{ email: data.email }, { phoneNumber: data.phoneNumber }],
      // });

      // if (existingFollowUp) throw new Error("FollowUp already exists");

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

      return { followUp, newMessage };
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

  // async updateFollowUp(
  //   userId: string,
  //   followUpId: string,
  //   data: Partial<FollowUpDto>
  // ) {
  //   try {
  //     const updatedFollowUp = await FollowUpModel.findByIdAndUpdate(
  //       { _id: followUpId, userId },
  //       data,
  //       { new: true, runValidators: true }
  //     );
  //     if (!updatedFollowUp)
  //       throw new Error("Follow-up not found or unauthorized");
  //     return updatedFollowUp;
  //   } catch (error) {
  //     if (error instanceof Error) {
  //       throw new Error(`Failed to update follow-up: ${error.message}`);
  //     } else {
  //       throw new Error(
  //         "Failed to update follow-up: An unknown error occurred"
  //       );
  //     }
  //   }
  // }

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
