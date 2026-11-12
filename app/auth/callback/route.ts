import { NextResponse } from "next/server";
import { userClient } from "@/lib/supabase";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  if (code) {
    const supabase = await userClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    return NextResponse.redirect(new URL(error ? "/login?error=link" : "/portal", url.origin));
  }
  // Invite and password-recovery emails use one-time sessions in the URL
  // fragment. Redirects preserve the fragment; only the browser can read it.
  // PasswordForm consumes it, removes it from history, and verifies the user.
  return NextResponse.redirect(new URL("/auth/password", url.origin), { headers: { "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" } });
}
