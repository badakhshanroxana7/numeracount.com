import { NextResponse } from "next/server";
import { accessibleClient } from "@/lib/auth";
import { documentPath, documentStorage } from "@/lib/documents";

export async function GET(_request: Request, context: { params: Promise<{ id: string; fileId: string }> }) {
  const { id, fileId } = await context.params;
  const access = await accessibleClient(id);
  if (!access) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const path = documentPath(access, fileId);
    const storage = await documentStorage(access);
    const { data, error } = await storage.download(path);
    if (error || !data) return NextResponse.json({ error: "File not found" }, { status: 404 });
    return new Response(data, { headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(fileId.slice(37))}`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    } });
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}
