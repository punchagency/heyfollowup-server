import dotenv from "dotenv";
dotenv.config();

export const env = {
  server_port: process.env.SERVER_PORT || 5000,
  mongoURI: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET!,
  refreshSecret: process.env.REFRESH_SECRET!,
  redirectsUrl: process.env.FRONTEND_PAYMENT_SUCCESS_URL as string,
  smtp: {
    host: process.env.SMTP_HOST!,
    port: Number(process.env.SMTP_PORT!),
    user: process.env.SMTP_USER!,
    pass: process.env.SMTP_PASS!,
  },
  stripe: {
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY as string,
    secretKey: process.env.STRIPE_SECRET_KEY as string,
    productId: process.env.PRODUCT_ID as string,
  },
  firebase: {
    serviceAccount: process.env.FIREBASE_SERVICE_ACCOUNT_BASE64 as string,
  },
};
