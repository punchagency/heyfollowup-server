import nodemailer from "nodemailer";
import { env } from "./env";

const transporter = nodemailer.createTransport({
  host: env.smtp.host,
  port: env.smtp.port,
  secure: false,
  auth: {
    user: env.smtp.user,
    pass: env.smtp.pass,
  },
});

export const sendOTPEmail = async (
  to: string,
  subject: string,
  text: string
) => {
  const res = await transporter.sendMail({
    from: `"No-Reply" <${env.smtp.user}>`,
    to,
    subject,
    text,
  });
  console.log(text);
};
