import { authJSON, sameOrigin } from "@/lib/auth-requests";
import { userClient } from "@/lib/supabase";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return authJSON({ error: "Forbidden" }, 403);
  const supabase = await userClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user?.email_confirmed_at) return authJSON({ error: "Open a new password setup email or sign in before changing your password." }, 401);
  const input = await request.json().catch(() => null);
  if (typeof input?.password !== "string" || input.password.length < 12 || input.password.length > 72) {
    return authJSON({ error: "Choose a password between 12 and 72 characters." }, 400);
  }
  const { error } = await supabase.auth.updateUser({ password: input.password });
  if (error) return authJSON({ error: "Your password could not be saved. Choose a different password or request a new setup link." }, 400);
  return authJSON({ ok: true });
}
