import { Service } from "typedi";
import { PaymentDto } from "../dtos/payment.dto";
import { PaymentModel, SavedPaymentMethodModel } from "../models/payment.model";
import { stripe } from "../../config/stripe-config";
import mongoose from "mongoose";
import { UserModel } from "../../auth/models/auth.model";
import Stripe from "stripe";

@Service()
export class PaymentService {
  private readonly fixedAmount = 13400; // Fixed price in cents ($134.00)
  private readonly currency = "usd";

  async processPayment(userId: string, paymentDto: PaymentDto) {
    const user = await UserModel.findById(userId);
    if (!user || !user.stripeCustomerId) {
      throw new Error("Invalid user or missing Stripe customer ID.");
    }

    if (user.subscribed) {
      throw new Error("User is already subscribed.");
    }

    const stripeCustomerId = user.stripeCustomerId;
    console.log({ stripeCustomerId });

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const stripeCustomer = await stripe.customers.retrieve(stripeCustomerId);
      if (!stripeCustomer || stripeCustomer.deleted) {
        throw new Error("Invalid Stripe customer ID.");
      }

      const paymentMethod = await stripe.paymentMethods.retrieve(
        paymentDto.paymentMethodId
      );
      console.log(paymentMethod.customer, paymentDto.paymentMethodId);

      // If paymentMethod is not attached to a customer, attach it
      if (!paymentMethod.customer) {
        console.log("Attaching PaymentMethod to customer...");
        await stripe.paymentMethods.attach(paymentDto.paymentMethodId, {
          customer: stripeCustomerId,
        });
      }

      // Create Payment Intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: this.fixedAmount,
        currency: this.currency,
        payment_method: paymentDto.paymentMethodId,
        customer: stripeCustomerId,
        confirm: true,
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: "never",
        },
        setup_future_usage: paymentDto.saveCard ? "off_session" : undefined, // Save card if checked
      });

      console.log("paymentIntent.status: ", paymentIntent.status);

      // Save payment transaction
      const payment = await PaymentModel.create(
        [
          {
            userId,
            amount: this.fixedAmount / 100,
            currency: this.currency,
            status: paymentIntent.status,
            stripePaymentIntentId: paymentIntent.id,
          },
        ],
        { session }
      );

      //  Check if card is already saved
      const existingSavedCard = await SavedPaymentMethodModel.findOne({
        userId,
        stripePaymentMethodId: paymentDto.paymentMethodId,
      });

      if (paymentDto.saveCard && !existingSavedCard) {
        const paymentMethod = await stripe.paymentMethods.retrieve(
          paymentDto.paymentMethodId
        );

        await SavedPaymentMethodModel.create(
          [
            {
              userId,
              stripePaymentMethodId: paymentDto.paymentMethodId,
              brand: paymentMethod.card?.brand,
              last4: paymentMethod.card?.last4,
              expMonth: paymentMethod.card?.exp_month,
              expYear: paymentMethod.card?.exp_year,
            },
          ],
          { session }
        );
      } else if (!paymentDto.saveCard && existingSavedCard) {
        await SavedPaymentMethodModel.deleteOne(
          { _id: existingSavedCard._id },
          { session }
        );
      }

      if (paymentIntent.status === "succeeded") {
        await UserModel.updateOne(
          { _id: userId },
          { $set: { subscribed: true } },
          { session }
        );
      }

      await session.commitTransaction();
      session.endSession();
      return { success: true, payment };
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof Stripe.errors.StripeError) {
        throw new Error(`Stripe error: ${error.message}`);
      }
      throw new Error(`Payment failed: ${(error as Error).message}`);
    } finally {
      session.endSession();
    }
  }

  async getAllPayments(userId: string) {
    try {
      return await PaymentModel.find({ userId }).sort({ createdAt: -1 });
    } catch (error) {
      throw new Error(`Failed to fetch payments: ${(error as Error).message}`);
    }
  }

  async getPaymentById(userId: string, paymentId: string) {
    try {
      if (!mongoose.Types.ObjectId.isValid(paymentId)) {
        throw new Error("Invalid mongodb ID");
      }
      const payment = await PaymentModel.findOne({ _id: paymentId, userId });
      if (!payment) throw new Error("Payment not found");
      return payment;
    } catch (error) {
      throw new Error(`Failed to fetch payment: ${(error as Error).message}`);
    }
  }

  async getSavedCards(userId: string) {
    try {
      return await SavedPaymentMethodModel.find({ userId });
    } catch (error) {
      throw new Error(
        `Failed to fetch saved cards: ${(error as Error).message}`
      );
    }
  }

  async deletePaymentMethod(userId: string, paymentMethodId: string) {
    try {
      const paymentMethod = await SavedPaymentMethodModel.findOneAndDelete({
        userId,
        stripePaymentMethodId: paymentMethodId,
      });
      if (!paymentMethod) {
        throw new Error("Payment method not found");
      }
      await stripe.paymentMethods.detach(paymentMethodId);
    } catch (error) {
      throw new Error(
        `Failed to delete payment method: ${(error as Error).message}`
      );
    }
  }
}
