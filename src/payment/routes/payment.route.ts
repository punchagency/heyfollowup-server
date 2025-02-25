import express from "express";
import { Container } from "typedi";
import { authenticate } from "../../common/middlewares/auth.middleware";
import { PaymentController } from "../controllers/payment.controller";

const paymentRouter = express.Router();
const paymentController = Container.get(PaymentController);

paymentRouter.post(
  "/",
  authenticate,
  paymentController.processPayment.bind(paymentController)
);
paymentRouter.get(
  "/",
  authenticate,
  paymentController.getAllPayments.bind(paymentController)
);
paymentRouter.get(
  "/saved-cards",
  authenticate,
  paymentController.getSavedCards.bind(paymentController)
);
paymentRouter.get(
  "/:paymentId",
  authenticate,
  paymentController.getPaymentById.bind(paymentController)
);
paymentRouter.delete(
  "/:paymentMethodId",
  authenticate,
  paymentController.deletePaymentMethod.bind(paymentController)
);

export default paymentRouter;
