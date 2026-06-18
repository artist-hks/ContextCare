import { getIronSession, type IronSession, type SessionOptions } from "iron-session";
import { cookies } from "next/headers";

export interface SessionData {
  doctorId?: string;
}

// Safe hardcoded fallback so the app works with NO .env file at all.
// SESSION_SECRET is optional; if set it overrides the fallback.
const SECRET =
  process.env.SESSION_SECRET ??
  "contextcare-ai-demo-session-secret-please-change-in-prod-0123456789";

export const sessionOptions: SessionOptions = {
  password: SECRET,
  cookieName: "contextcare_session",
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    // 30-day session.
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  },
};

export async function getSession(): Promise<IronSession<SessionData>> {
  return getIronSession<SessionData>(cookies(), sessionOptions);
}
