import { authJSON, normalizedEmail, sameOrigin } from "@/lib/auth-requests";
import { userClient } from "@/lib/supabase";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return authJSON({ error: "Forbidden" }, 403);
  const input = await request.json().catch(() => null);
  const email = normalizedEmail(input?.email);
  if (!email || typeof input?.password !== "string" || !input.password || input.password.length > 256) {
    return authJSON({ error: "Enter your email and password." }, 400);
  }
  const supabase = await userClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password: input.password });
  if (error) return authJSON({ error: error.status === 429 ? "Too many attempts. Please wait and try again." : "The email or password was not recognized. Try again or reset your password." }, error.status === 429 ? 429 : 401);
  return authJSON({ ok: true });
}
