import { Service } from "typedi";
import { Response } from "express";
import { validateOrReject } from "class-validator";
import { FollowUpService } from "../services/followUp.service";
import { FollowUpDto } from "../dtos/followUp.dto";
import { AuthRequest } from "../../common/middlewares/auth.middleware";

@Service()
export class FollowUpController {
  constructor(private readonly followUpService: FollowUpService) {}

  async createFollowUp(req: AuthRequest, res: Response): Promise<void> {
    try {
      const data = Object.assign(new FollowUpDto(), req.body);
      data.date = new Date(data.date);
      await validateOrReject(data);
      const followUp = await this.followUpService.createFollowUp(
        req.user.id,
        data
      );
      res.status(201).json({ success: true, followUp });
    } catch (error: any) {
      console.log("error", error);
      res.status(400).json({
        success: false,
        error: error.message || "Failed to create follow-up",
      });
    }
  }

  async getFollowUps(req: AuthRequest, res: Response): Promise<void> {
    try {
      const followUps = await this.followUpService.getFollowUps(req.user.id);
      res.status(200).json({ success: true, followUps });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async getFollowUpById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { followUpId } = req.params;
      const followUp = await this.followUpService.getFollowUpById(
        req.user.id,
        followUpId
      );
      res.status(200).json({ success: true, followUp });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async updateFollowUp(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { followUpId } = req.params;
      const updatedFollowUp = await this.followUpService.updateFollowUp(
        req.user.id,
        followUpId,
        req.body
      );
      res.status(200).json({ success: true, followUp: updatedFollowUp });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async deleteFollowUp(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { followUpId } = req.params;
      const message = await this.followUpService.deleteFollowUp(
        req.user.id,
        followUpId
      );
      res.status(200).json({ success: true, message });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}
