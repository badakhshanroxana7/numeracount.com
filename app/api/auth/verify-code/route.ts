import { NextResponse } from "next/server";
import { userClient } from "@/lib/supabase";

export async function POST(request: Request) {
  const { email, code } = await request.json();
  if (typeof email !== "string" || typeof code !== "string" || !/^\d{6,8}$/.test(code)) {
    return NextResponse.json({ error: "Enter the code from your email." }, { status: 400 });
  }
  const supabase = await userClient();
  const { error } = await supabase.auth.verifyOtp({ email: email.toLowerCase(), token: code, type: "email" });
  if (error) return NextResponse.json({ error: "That code is invalid or expired." }, { status: 400 });
  return NextResponse.json({ ok: true });
}
