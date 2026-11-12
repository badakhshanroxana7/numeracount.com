import { createClient } from "@supabase/supabase-js";
import { authJSON, normalizedEmail, sameOrigin } from "@/lib/auth-requests";
import { requiredEnv } from "@/lib/env";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return authJSON({ error: "Forbidden" }, 403);
  const input = await request.json().catch(() => null);
  const email = normalizedEmail(input?.email);
  if (!email) return authJSON({ error: "Enter a valid email address." }, 400);
  // A one-time recovery link establishes a session in its receiving browser.
  // No user directory lookup, account creation, or service-role key is needed.
  const supabase = createClient(requiredEnv("NEXT_PUBLIC_SUPABASE_URL"), requiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"), {
    auth: { flowType: "implicit", persistSession: false, autoRefreshToken: false },
  });
  const siteUrl = new URL(process.env.SITE_URL || request.url).origin;
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${siteUrl}/auth/callback` });
  if (error?.status === 429) return authJSON({ error: "Please wait before requesting another password email." }, 429);
  if (error) console.error("Password recovery request failed", { code: error.code, status: error.status });
  // Keep the response identical for registered and unregistered addresses.
  return authJSON({ ok: true }, 202);
}
