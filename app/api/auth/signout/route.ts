import { NextResponse } from "next/server";
import { userClient } from "@/lib/supabase";

export async function POST(request: Request) {
  const supabase = await userClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/", request.url), 303);
}
