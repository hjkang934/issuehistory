import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

// 개발자지침.md §3-4: 미로그인 시 포털 SSO 로 리다이렉트.
// 참고: 이 Next.js 버전은 middleware.ts 가 아니라 proxy.ts 로 이름이 바뀌었다
// (node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md).
export function proxy(request: NextRequest) {
  const user = verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
  if (!user) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!auth/|health|_next/static|_next/image|favicon.ico).*)",
  ],
};
