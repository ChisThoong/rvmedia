import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const getJwtSecret = () => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error("Missing JWT_SECRET in environment variables.");
  }
  return jwtSecret;
};

export type AuthUser = {
  sub: string;
  username: string;
};

export const signToken = (payload: AuthUser) =>
  jwt.sign(payload, getJwtSecret(), { expiresIn: "7d" });

export const verifyToken = (token: string) =>
  jwt.verify(token, getJwtSecret()) as AuthUser;

export const getAuthUser = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) {
    return null;
  }
  try {
    return verifyToken(token);
  } catch (error) {
    return null;
  }
};
