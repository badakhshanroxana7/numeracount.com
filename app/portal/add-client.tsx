"use client";
import { useRef, useState } from "react";
import { Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AddClient() {
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
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
      else { dialog.current?.close(); router.push(`/portal/${result.id}`); router.refresh(); }
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not create client space."); }
    finally { setBusy(false); }
  }
  return <div className="add-client-wrap">
    <button className="button button-primary" onClick={() => dialog.current?.showModal()}><Plus size={17} aria-hidden="true"/> New client space</button>
    <dialog ref={dialog} className="modal" aria-labelledby="create-client-title" aria-describedby="create-client-description">
      <button className="modal-close" onClick={() => dialog.current?.close()} aria-label="Close create client space"><X size={19} aria-hidden="true"/></button>
      <span className="section-kicker">NEW CLIENT</span><h2 id="create-client-title">Create a private space</h2><p id="create-client-description">Only staff and this email address will be able to access its documents.</p>
      {createdId ? <a className="button button-primary" href={`/portal/${createdId}`}>Open created space</a> : <form onSubmit={submit} aria-busy={busy}>
        <label htmlFor="client-name">Client name</label><input id="client-name" name="name" required maxLength={100} autoComplete="name" placeholder="Client name"/>
        <label htmlFor="client-email">Client email</label><input id="client-email" type="email" name="email" required autoComplete="email" placeholder="client@example.com"/>
        {error && <p className="form-error" role="alert">{error}</p>}<button className="button button-primary" disabled={busy}>{busy ? "Creating…" : "Create space"}</button>
      </form>}
      {createdId && error && <p className="form-error" role="alert">{error}</p>}
    </dialog>
  </div>;
}
