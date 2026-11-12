"use client";
import { useRef, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Upload } from "lucide-react";

export default function UploadForm({ clientId }: { clientId: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function upload(file?: File) {
    if (!file) return;
    if (!file.size || file.size > 10 * 1024 * 1024) { setError("Choose a file up to 10 MB."); return; }
    setBusy(true); setError("");
    try {
      const response = await fetch(`/api/clients/${clientId}/files`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: file.name, size: file.size }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Upload failed.");
      const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
      const { error: uploadError } = await supabase.storage.from("Client-Documents").uploadToSignedUrl(result.path, result.token, file, { contentType: "application/octet-stream" });
      if (uploadError) throw new Error("Upload failed. Please try again.");
      window.location.reload();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Upload failed."); }
    finally { setBusy(false); if (input.current) input.current.value = ""; }
  }
  return <div className="upload-control"><input ref={input} type="file" hidden onChange={(event) => upload(event.target.files?.[0])}/><button className="button button-primary" onClick={() => input.current?.click()} disabled={busy}><Upload size={17}/>{busy ? "Uploading…" : "Upload document"}</button>{error && <span className="form-error" role="alert">{error}</span>}</div>;
}
