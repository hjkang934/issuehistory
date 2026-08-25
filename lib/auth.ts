import crypto from "node:crypto";
import { cookies } from "next/headers";

// AJW App Hub 계약: 앱허브가 주입하는 환경변수 (개발자지침.md §3-4, templates/boilerplate/server.mjs 참고)
const PORTAL_PUBLIC = (process.env.PORTAL_PUBLIC_URL || "").replace(/\/$/, "");
const PORTAL_INTERNAL = (process.env.PORTAL_INTERNAL_URL || "http://portal:3000").replace(/\/$/, "");
const CLIENT_ID = process.env.OAUTH_CLIENT_ID || "";
const CLIENT_SECRET = process.env.OAUTH_CLIENT_SECRET || "";
const SECRET = process.env.SESSION_SECRET || "dev-insecure-secret";

export const SESSION_COOKIE = "bp_session";
export const STATE_COOKIE = "bp_state";

export type SessionUser = {
  sub: string;
  email: string;
  name: string;
  app_role: string;
};

const b64u = (s: string) => Buffer.from(s).toString("base64url");
const unb64u = (s: string) => Buffer.from(s, "base64url").toString();

function sign(obj: unknown): string {
  const data = b64u(JSON.stringify(obj));
  const mac = crypto.createHmac("sha256", SECRET).update(data).digest("base64url");
  return `${data}.${mac}`;
}

function verify<T>(token: string | undefined | null): T | null {
  if (!token || !token.includes(".")) return null;
  const [data, mac] = token.split(".");
  const expected = crypto.createHmac("sha256", SECRET).update(data).digest("base64url");
  if (mac !== expected) return null;
  try {
    return JSON.parse(unb64u(data)) as T;
  } catch {
    return null;
  }
}

function redirectUri(appPublicUrl: string) {
  return `${appPublicUrl.replace(/\/$/, "")}/auth/callback`;
}

export function authorizeUrl(appPublicUrl: string, state: string): string {
  const q = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: redirectUri(appPublicUrl),
    response_type: "code",
    scope: "openid profile email",
    state,
  });
  return `${PORTAL_PUBLIC}/api/oauth/authorize?${q}`;
}

export function signState(state: string): string {
  return sign({ state, ts: Date.now() });
}

export function verifyState(token: string | undefined | null, expected: string): boolean {
  const saved = verify<{ state: string }>(token);
  return !!saved && saved.state === expected;
}

export async function exchangeToken(code: string, appPublicUrl: string): Promise<{ access_token: string }> {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri(appPublicUrl),
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
  });
  const r = await fetch(`${PORTAL_INTERNAL}/api/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!r.ok) throw new Error(`token ${r.status}`);
  return r.json();
}

export async function fetchUserinfo(accessToken: string): Promise<{ sub: string; email: string; name: string; app_role?: string }> {
  const r = await fetch(`${PORTAL_INTERNAL}/api/oauth/userinfo`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!r.ok) throw new Error(`userinfo ${r.status}`);
  return r.json();
}

export function signSession(user: { sub: string; email: string; name: string; app_role?: string }): string {
  return sign({ sub: user.sub, email: user.email, name: user.name, app_role: user.app_role || "user" });
}

/** 쿠키 원문 값으로 세션 검증 (proxy.ts처럼 next/headers 없이 NextRequest만 있는 곳에서 사용). */
export function verifySessionToken(token: string | undefined | null): SessionUser | null {
  return verify<SessionUser>(token);
}

/** 서버 컴포넌트·라우트 핸들러·서버 함수 어디서든 사용. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}

export function portalPublicUrl(): string {
  return PORTAL_PUBLIC;
}
