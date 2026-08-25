import { cookies } from "next/headers";
import { portalPublicUrl, SESSION_COOKIE } from "@/lib/auth";

export async function GET(request: Request) {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  const target = portalPublicUrl() || new URL("/", request.url).toString();
  return Response.redirect(target, 302);
}
