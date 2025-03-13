import * as admin from "firebase-admin";
import { env } from "./env";
const serviceAccountJson = Buffer.from(
  env.firebase.serviceAccount,
  "base64"
).toString("utf-8");

const serviceAccount = JSON.parse(serviceAccountJson);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export const sendPushNotifications = async (
  deviceTokens: string[],
  message: string
) => {
  try {
    const notifications = deviceTokens.map((token) => ({
      token,
      notification: {
        title: "Follow-Up Reminder",
        body: message,
      },
    }));

    // Send notifications in bulk
    const response = await admin.messaging().sendEach(notifications);

    console.log("Notifications sent:", response);
  } catch (err) {
    console.error("Error sending notifications:", err);
  }
};
