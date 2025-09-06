import { auth } from "@/auth"

// FIX: This line tells Next.js to run the middleware in the Node.js environment.
export const runtime = "nodejs";

export default auth;

// The matcher configuration remains the same.
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"], 
};