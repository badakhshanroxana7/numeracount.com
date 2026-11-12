import { NextResponse } from "next/server";

export function sameOrigin(request: Request) {
  return request.headers.get("origin") === new URL(process.env.SITE_URL || request.url).origin;
}

export function normalizedEmail(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
}

export function authJSON(body: { ok?: boolean; error?: string }, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}
