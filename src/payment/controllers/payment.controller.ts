import { Service } from "typedi";
import { NextFunction, Response } from "express";
import { validateOrReject } from "class-validator";
import { PaymentService } from "../services/payment.service";
import { PaymentDto } from "../dtos/payment.dto";
import { AuthRequest } from "../../common/middlewares/auth.middleware";
import { ApiError } from "../../common/middlewares/error.middleware";

@Service()
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  async processPayment(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const paymentData = Object.assign(new PaymentDto(), req.body);
      await validateOrReject(paymentData);

      const result = await this.paymentService.processPayment(
        req.user.id,
        paymentData
      );

      res.status(201).json({ success: true, result });
    } catch (error: any) {
      next(new ApiError(error, 400));
    }
  }

  async getAllPayments(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const payments = await this.paymentService.getAllPayments(req.user.id);
      res.status(200).json({ success: true, payments });
    } catch (error: any) {
      next(new ApiError(error, 400));
    }
  }

  async getPaymentById(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const payment = await this.paymentService.getPaymentById(
        req.user.id,
        req.params.paymentId
      );
      res.status(200).json({ success: true, payment });
    } catch (error: any) {
      next(new ApiError(error, 400));
    }
  }

  async getSavedCards(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const cards = await this.paymentService.getSavedCards(req.user.id);
      res.status(200).json({ success: true, cards });
    } catch (error: any) {
      next(new ApiError(error, 400));
    }
  }

  async deletePaymentMethod(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await this.paymentService.deletePaymentMethod(
        req.user.id,
        req.params.paymentMethodId
      );
      res
        .status(200)
        .json({ success: true, message: "Payment method deleted" });
    } catch (error: any) {
      next(new ApiError(error, 400));
    }
  }
}
