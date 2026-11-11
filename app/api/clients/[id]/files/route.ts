import { NextResponse } from "next/server";
import { accessibleClient } from "@/lib/auth";
import { documentPath, documentStorage, MAX_FILE_SIZE } from "@/lib/documents";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const access = await accessibleClient(id);
  if (!access) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (request.headers.get("origin") !== new URL(request.url).origin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const input = await request.json().catch(() => null);
  if (!input || typeof input.name !== "string" || !input.name.trim() || input.name.length > 200 || !Number.isInteger(input.size) || input.size <= 0 || input.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "Choose a file up to 10 MB." }, { status: 400 });
  }
  try {
    const name = input.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = documentPath(access, `${crypto.randomUUID()}_${name}`);
    const storage = await documentStorage(access);
    const { data, error } = await storage.createSignedUploadUrl(path, { upsert: false });
    if (error) throw error;
    return NextResponse.json({ path, token: data.token }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Upload unavailable. Please contact Numeracount." }, { status: 500 });
  }
}
