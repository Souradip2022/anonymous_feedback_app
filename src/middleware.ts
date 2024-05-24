import {NextRequest, NextResponse} from 'next/server'
import {getToken, JWT} from "next-auth/jwt";

export {default} from "next-auth/middleware"

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/sign-in.tsx", "/sign-up", "dashboard?:path*", "/", "verify/:path*"],
}

// This function can be marked `async` if using `await` inside
export async function middleware(req: NextRequest) {

  const token = await getToken({req});
  const url = req.nextUrl;

  // Redirect to dashboard if the user is already authenticated
  // and trying to access sign-in.tsx, sign-up, or home page
  if (url.pathname.startsWith("/sign-in.tsx") ||
    url.pathname.startsWith("/sign-up") ||
    url.pathname.startsWith("/verify") ||
    url.pathname === "/"
  ) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl))
  }


  if (!token && url.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/sign-in.tsx", req.url))
  }

  return NextResponse.next();
}

