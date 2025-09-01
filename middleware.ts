import { auth } from "@/auth"

// FIX: Tambahkan baris ini untuk memberitahu Next.js
// agar menjalankan middleware di lingkungan Node.js
export const runtime = "nodejs";

export default auth;

// Konfigurasi matcher tetap sama (opsional)
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
