import {NextRequest, NextResponse} from 'next/server'
import {getToken, JWT} from "next-auth/jwt";

export {default} from "next-auth/middleware"

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/sign-in", "/sign-up", "/", "/verify-user/:path*"],
}

export async function middleware(request: NextRequest) {

  const token = await getToken({req: request, secret: process.env.AUTH_SECRET});
  // console.log("Payload ", token);
  const url = request.nextUrl;

  if (token && (url.pathname.startsWith("/sign-in") ||
    url.pathname.startsWith("/sign-up") ||
    url.pathname.startsWith("/verify-user") ||
    url.pathname === "/")
  ) {

    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!token && url.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/sign-in", request.url))
  }

  return NextResponse.next();
}

