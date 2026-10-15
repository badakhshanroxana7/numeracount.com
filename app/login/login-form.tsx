"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const response = await fetch("/api/auth/send-link", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Something went wrong.");
      setSent(true);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Something went wrong."); }
    finally { setBusy(false); }
  }

  return <form className="auth-form" onSubmit={submit}>{sent ? <p role="status">Check <strong>{email}</strong> for your sign-in link. Open it on this device to enter your portal.</p> : <><label htmlFor="email">Email address</label><input id="email" type="email" autoComplete="email" required placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)}/><button className="button button-primary auth-button" type="submit" disabled={busy}>{busy ? "Please wait…" : "Email me a sign-in link"}<ArrowRight size={18}/></button></>}{error && <p className="form-error" role="alert">{error}</p>}{sent && <button className="plain-button" type="button" onClick={() => setSent(false)}>Use a different email</button>}</form>;
}
