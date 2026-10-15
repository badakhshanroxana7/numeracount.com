"use client";
import { useRef, useState } from "react";
import { Upload } from "lucide-react";

export default function UploadForm({ clientId }: { clientId: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function upload(file?: File) {
    if (!file) return;
    setBusy(true); setError("");
    try {
      const body = new FormData(); body.append("file", file);
      const response = await fetch(`/api/clients/${clientId}/files`, { method: "POST", body });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Upload failed.");
      window.location.reload();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Upload failed."); }
    finally { setBusy(false); }
  }
  return <div className="upload-control"><input ref={input} type="file" hidden onChange={(event) => upload(event.target.files?.[0])}/><button className="button button-primary" onClick={() => input.current?.click()} disabled={busy}><Upload size={17}/>{busy ? "Uploading…" : "Upload document"}</button>{error && <span className="form-error" role="alert">{error}</span>}</div>;
}
