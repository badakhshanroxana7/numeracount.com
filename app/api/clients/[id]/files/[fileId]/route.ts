import { NextResponse } from "next/server";
import { accessibleClient } from "@/lib/auth";
import { downloadFile } from "@/lib/box";

export async function GET(_request: Request, context: { params: Promise<{ id: string; fileId: string }> }) {
  const { id, fileId } = await context.params;
  const access = await accessibleClient(id);
  if (!access) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const result = await downloadFile(access.client.box_folder_id, fileId);
    if (!result) return NextResponse.json({ error: "File not found" }, { status: 404 });
    return new Response(result.content.body, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(result.file.name)}`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return NextResponse.json({ error: "Download failed." }, { status: 500 });
  }
}
