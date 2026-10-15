import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getActor } from "@/lib/auth";
import { requiredEnv } from "@/lib/env";

export async function GET(request: Request) {
  const actor = await getActor();
  if (!actor || actor.role !== "staff") return NextResponse.redirect(new URL("/login", request.url));
  const state = randomBytes(32).toString("base64url");
  const siteUrl = requiredEnv("SITE_URL");
  const redirectUri = `${siteUrl}/api/box/callback`;
  const url = new URL("https://account.box.com/api/oauth2/authorize");
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", requiredEnv("BOX_CLIENT_ID"));
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("state", state);
  (await cookies()).set("box_oauth_state", state, {
    httpOnly: true, secure: siteUrl.startsWith("https://"), sameSite: "lax", path: "/api/box/callback", maxAge: 600,
  });
  return NextResponse.redirect(url);
}
