import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getActor } from "@/lib/auth";
import { ensurePortalRootFolder } from "@/lib/box";
import { connectBox } from "@/lib/box-oauth";
import { requiredEnv } from "@/lib/env";

export async function GET(request: Request) {
  const siteUrl = requiredEnv("SITE_URL");
  const url = new URL(request.url);
  const cookieStore = await cookies();
  const expected = cookieStore.get("box_oauth_state")?.value;
  cookieStore.delete("box_oauth_state");
  const actor = await getActor();
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (!actor || actor.role !== "staff" || !expected || !state || state !== expected || !code) {
    return NextResponse.redirect(new URL("/portal?box=error", siteUrl));
  }
  try {
    await connectBox(code, `${siteUrl}/api/box/callback`);
    await ensurePortalRootFolder();
    return NextResponse.redirect(new URL("/portal?box=connected", siteUrl));
  } catch {
    return NextResponse.redirect(new URL("/portal?box=error", siteUrl));
  }
}
