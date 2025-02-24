import jwt from "jsonwebtoken";
import { env } from "../../config/env";

export function generateToken(user: any) {
  return jwt.sign({ id: user._id, email: user.email }, env.jwtSecret, {
    expiresIn: "1d",
  });
}
