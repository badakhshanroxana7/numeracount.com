"use client";
import { useState } from "react";
import { Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AddClient() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [createdId, setCreatedId] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/clients", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: form.get("name"), email: form.get("email") }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not create client space.");
      if (!result.invitationSent) { setCreatedId(result.id); setError("Space created, but the invitation email could not be sent. Share your portal link with this client directly."); }
      else { router.push(`/portal/${result.id}`); router.refresh(); }
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not create client space."); }
    finally { setBusy(false); }
  }
  return <div className="add-client-wrap"><button className="button button-primary" onClick={() => setOpen(true)}><Plus size={17}/> New client space</button>{open && <div className="modal-backdrop" onClick={() => setOpen(false)}><div className="modal" role="dialog" aria-modal="true" aria-label="Create client space" onClick={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setOpen(false)} aria-label="Close"><X size={19}/></button><span className="section-kicker">NEW CLIENT</span><h2>Create a private space</h2><p>Only staff and this email address will be able to access its documents.</p>{createdId ? <a className="button button-primary" href={`/portal/${createdId}`}>Open created space</a> : <form onSubmit={submit}><label htmlFor="client-name">Client name</label><input id="client-name" name="name" required maxLength={100} placeholder="Client name"/><label htmlFor="client-email">Client email</label><input id="client-email" type="email" name="email" required placeholder="client@example.com"/>{error && <p className="form-error" role="alert">{error}</p>}<button className="button button-primary" disabled={busy}>{busy ? "Creating…" : "Create space"}</button></form>}{createdId && error && <p className="form-error" role="alert">{error}</p>}</div></div>}</div>;
}
