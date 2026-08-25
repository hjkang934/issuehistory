import crypto from "node:crypto";
import { cookies } from "next/headers";
import { authorizeUrl, signState, STATE_COOKIE } from "@/lib/auth";

export async function GET(request: Request) {
  const appPublicUrl = process.env.APP_PUBLIC_URL || new URL(request.url).origin;
  const state = crypto.randomBytes(16).toString("hex");

  const store = await cookies();
  store.set(STATE_COOKIE, signState(state), {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    maxAge: 600,
  });

  return Response.redirect(authorizeUrl(appPublicUrl, state), 302);
}
