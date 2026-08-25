import { cookies } from "next/headers";
import {
  exchangeToken,
  fetchUserinfo,
  signSession,
  verifyState,
  SESSION_COOKIE,
  STATE_COOKIE,
} from "@/lib/auth";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  const store = await cookies();
  const validState = !!state && verifyState(store.get(STATE_COOKIE)?.value, state);

  if (!code || !validState) {
    return new Response("로그인 검증 실패. 다시 시도하세요.", {
      status: 400,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  const appPublicUrl = process.env.APP_PUBLIC_URL || url.origin;

  try {
    const tok = await exchangeToken(code, appPublicUrl);
    const info = await fetchUserinfo(tok.access_token);

    store.set(SESSION_COOKIE, signSession(info), {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 28800,
    });
    store.delete(STATE_COOKIE);

    return Response.redirect(new URL("/", url), 302);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return new Response(`로그인 실패: ${message}`, {
      status: 500,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }
}
