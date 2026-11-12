"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { browserClient } from "@/lib/browser-supabase";

async function prepareSession(): Promise<string | null> {
  try {
    const params = new URLSearchParams(window.location.hash.slice(1));
    const hasFragment = Boolean(window.location.hash);
    window.history.replaceState(null, "", window.location.pathname);
    if (params.has("error") || params.has("error_code")) return "This password link has expired or could not be verified. Request a new link.";
    const supabase = browserClient();
    if (hasFragment) {
      const accessToken = params.get("access_token"), refreshToken = params.get("refresh_token");
      if (!accessToken || !refreshToken || !["invite", "recovery"].includes(params.get("type") || "")) return "This password link could not be verified. Request a new link.";
      const { error } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
      if (error) return "This password link has expired. Request a new link.";
    }
    const { data: { user }, error } = await supabase.auth.getUser();
    return error || !user?.email_confirmed_at ? "Open the link from your password setup email to continue, or sign in to your account first." : null;
  } catch { return "Your session could not be checked. Request a new password link and try again."; }
}

export default function PasswordForm() {
  const router = useRouter();
  const initialization = useRef<Promise<string | null> | null>(null);
  const [checking, setChecking] = useState(true);
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    let cancelled = false;
    initialization.current ??= prepareSession();
    initialization.current.then(message => { if (!cancelled) { setError(message || ""); setReady(!message); setChecking(false); } });
    return () => { cancelled = true; };
  }, []);
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setError("");
    if (password !== confirmation) { setError("The passwords do not match. Enter the same password in both fields."); return; }
    setBusy(true);
    try {
      const response = await fetch("/api/auth/password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Your password could not be saved.");
      setPassword(""); setConfirmation(""); router.replace("/portal"); router.refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Your password could not be saved."); }
    finally { setBusy(false); }
  }
  if (checking) return <p role="status">Checking your sign-in link…</p>;
  return <div>
    {ready && <form className="auth-form" onSubmit={submit} aria-busy={busy}>
      <p id="password-guidance" className="auth-instructions">Use 12–72 characters. Choose a password you don’t use for other accounts. You can paste one from your password manager.</p>
      <label htmlFor="new-password">New password</label><input id="new-password" type={show ? "text" : "password"} autoComplete="new-password" required minLength={12} maxLength={72} value={password} onChange={event => setPassword(event.target.value)} aria-describedby={error ? "password-guidance password-error" : "password-guidance"} aria-invalid={Boolean(error)}/>
      <label htmlFor="confirm-password">Confirm new password</label><input id="confirm-password" type={show ? "text" : "password"} autoComplete="new-password" required minLength={12} maxLength={72} value={confirmation} onChange={event => setConfirmation(event.target.value)} aria-invalid={Boolean(error)} aria-describedby={error ? "password-error" : undefined}/>
      <label className="show-password"><input type="checkbox" checked={show} onChange={event => setShow(event.target.checked)}/> Show passwords</label>
      <button className="button button-primary auth-button" disabled={busy}>{busy ? "Saving…" : "Save password and open portal"}</button>
    </form>}
    {error && <p id="password-error" className="form-error" role="alert">{error}</p>}
    <div className="auth-options"><Link className="text-link" href="/login?mode=reset">Request a new password setup link</Link><Link className="text-link" href="/login">Back to sign in</Link></div>
  </div>;
}
