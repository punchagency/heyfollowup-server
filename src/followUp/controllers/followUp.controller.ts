import { Service } from "typedi";
import { NextFunction, Response } from "express";
import { validateOrReject } from "class-validator";
import { FollowUpService } from "../services/followUp.service";
import { FollowUpDto, UpdateFollowUpDto } from "../dtos/followUp.dto";
import { AuthRequest } from "../../common/middlewares/auth.middleware";
import { ApiError } from "../../common/middlewares/error.middleware";
import { FollowUpMessageModel } from "../models/followUp.model";

@Service()
export class FollowUpController {
  constructor(private readonly followUpService: FollowUpService) {}

  async createFollowUp(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const data = Object.assign(new FollowUpDto(), req.body);
      await validateOrReject(data);
      const response = await this.followUpService.createFollowUp(
        req.user.id,
        data
      );
      res.status(201).json({ success: true, response });
    } catch (error: any) {
      next(new ApiError(error, 400));
    }
  }

  async getAllMessages(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const messages = await FollowUpMessageModel.find();
      res.status(200).json({ success: true, messages });
    } catch (error: any) {
      next(new ApiError(error, 400));
    }
  }

  async getFollowUps(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const followUps = await this.followUpService.getFollowUps(req.user.id);
      res.status(200).json({ success: true, followUps });
    } catch (error: any) {
      next(new ApiError(error, 400));
    }
  }

  async getFollowUpById(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { followUpId } = req.params;
      const followUp = await this.followUpService.getFollowUpById(
        req.user.id,
        followUpId
      );
      res.status(200).json({ success: true, followUp });
    } catch (error: any) {
      next(new ApiError(error, 400));
    }
  }

  async generateFollowUpMessage(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { followUpId } = req.params;
      const message = await this.followUpService.generateFollowUpMessage(
        req.user.id,
        followUpId
      );

      res.status(200).json({ success: true, message });
    } catch (error: any) {
      next(new ApiError(error, 400));
    }
  }

  async generateNewFollowUpMessage(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { followUpId } = req.params;
      const response = await this.followUpService.generateNewFollowUpMessage(
        req.user.id,
        followUpId
      );

      res.status(200).json({ success: true, response });
    } catch (error: any) {
      next(new ApiError(error, 400));
    }
  }

  async updateFollowUp(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const data = Object.assign(new UpdateFollowUpDto(), req.body);
      await validateOrReject(data);
      const { followUpId } = req.params;
      const response = await this.followUpService.updateFollowUp(
        req.user.id,
        followUpId,
        data
      );

      res.status(200).json({ success: true, response });
    } catch (error: any) {
      next(new ApiError(error, 400));
    }
  }

  // async deleteFollowUp(req: AuthRequest, res: Response): Promise<void> {
  //   try {
  //     const { followUpId } = req.params;
  //     const message = await this.followUpService.deleteFollowUp(
  //       req.user.id,
  //       followUpId
  //     );
  //     res.status(200).json({ success: true, message });
  //   } catch (error: any) {
  //     res.status(400).json({ success: false, error: error.message });
  //   }
  // }
}
