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

    const stripeCustomerId = user.stripeCustomerId;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const stripeCustomer = await stripe.customers.retrieve(stripeCustomerId);
      if (!stripeCustomer || stripeCustomer.deleted) {
        throw new Error("Invalid Stripe customer ID.");
      }

      // Validate that the payment method exists and belongs to the user
      const paymentMethod = await stripe.paymentMethods.retrieve(
        paymentDto.paymentMethodId
      );
      if (paymentMethod.customer !== stripeCustomerId) {
        throw new Error("Payment method does not belong to the user.");
      }

      // Create Payment Intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: this.fixedAmount, // $134.00 in cents
        currency: this.currency,
        payment_method: paymentDto.paymentMethodId,
        customer: stripeCustomerId, // Ensure user has a Stripe customer ID
        confirm: true,
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

      // ✅ Check if card is already saved
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

      await session.commitTransaction();
      session.endSession();
      return { success: true, payment };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      if (error instanceof Stripe.errors.StripeError) {
        throw new Error(`Stripe error: ${error.message}`);
      }
      throw new Error(`Payment failed: ${(error as Error).message}`);
    }
  }

  async getAllPayments(userId: string) {
    return await PaymentModel.find({ userId }).sort({ createdAt: -1 });
  }

  // ✅ Get a specific payment by ID
  async getPaymentById(userId: string, paymentId: string) {
    const payment = await PaymentModel.findOne({ _id: paymentId, userId });
    if (!payment) {
      throw new Error("Payment not found");
    }
    return payment;
  }

  // ✅ Get saved cards for a user
  async getSavedCards(userId: string) {
    return await SavedPaymentMethodModel.find({ userId });
  }

  // ✅ Delete a saved payment method
  async deletePaymentMethod(userId: string, paymentMethodId: string) {
    const paymentMethod = await SavedPaymentMethodModel.findOneAndDelete({
      userId,
      stripePaymentMethodId: paymentMethodId,
    });

    if (!paymentMethod) {
      throw new Error("Payment method not found");
    }

    // Optionally, detach the payment method from Stripe
    await stripe.paymentMethods.detach(paymentMethodId);
  }
}
