import { NextResponse } from "next/server";
import { accessibleClient } from "@/lib/auth";
import { uploadFile } from "@/lib/box";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const access = await accessibleClient(id);
  if (!access) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const length = Number(request.headers.get("content-length") || "0");
  if (length > 10 * 1024 * 1024 + 4096) return NextResponse.json({ error: "Maximum file size is 10 MB." }, { status: 413 });
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0 || file.size > 10 * 1024 * 1024 || file.name.length > 200) {
    return NextResponse.json({ error: "Choose a file up to 10 MB." }, { status: 400 });
  }
  try {
    await uploadFile(access.client.box_folder_id, file);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 });
  }
}
