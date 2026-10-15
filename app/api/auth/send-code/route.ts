import { NextResponse } from "next/server";
import { userClient } from "@/lib/supabase";

export async function POST(request: Request) {
  const { email } = await request.json();
  if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  const supabase = await userClient();
  const { error } = await supabase.auth.signInWithOtp({ email: email.toLowerCase(), options: { shouldCreateUser: true } });
  if (error) return NextResponse.json({ error: "We could not send a code. Please try again." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
