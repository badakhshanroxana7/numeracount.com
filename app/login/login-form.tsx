"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

type Mode = "password" | "reset" | "link";
export default function LoginForm({ initialMode = "password", initialError = false }: { initialMode?: Mode; initialError?: boolean }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(initialError ? "That email link could not be verified. Request a new link or sign in with your password." : "");
  function changeMode(next: Mode) { setMode(next); setSent(false); setError(""); setPassword(""); }
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const endpoint = mode === "password" ? "sign-in" : mode === "reset" ? "recover" : "send-link";
      const response = await fetch(`/api/auth/${endpoint}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, ...(mode === "password" ? { password } : {}) }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Please try again.");
      setPassword("");
      if (mode === "password") { router.push("/portal"); router.refresh(); }
      else setSent(true);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Please try again."); }
    finally { setBusy(false); }
  }
  return <div>
    <form className="auth-form" onSubmit={submit} aria-busy={busy}>
      {sent ? <p role="status">{mode === "reset" ? <>If an account exists for <strong>{email}</strong>, we’ll email a link to set or reset your password. Check your inbox and spam folder.</> : <>Check <strong>{email}</strong> for your sign-in link. Open it in the same browser where you requested it.</>}</p> : <>
        {mode === "reset" && <p id="reset-description" className="auth-instructions">Already a client? Use the email registered for your client space. The email link lets you choose your own password.</p>}
        <label htmlFor="email">Email address</label><input id="email" type="email" autoComplete={mode === "password" ? "username" : "email"} required maxLength={254} aria-invalid={Boolean(error)} aria-describedby={error ? "login-error" : mode === "reset" ? "reset-description" : undefined} placeholder="you@example.com" value={email} onChange={event => setEmail(event.target.value)}/>
        {mode === "password" && <><label htmlFor="password">Password</label><input id="password" type={showPassword ? "text" : "password"} autoComplete="current-password" required maxLength={256} value={password} onChange={event => setPassword(event.target.value)} aria-invalid={Boolean(error)} aria-describedby={error ? "login-error" : undefined}/><label className="show-password"><input type="checkbox" checked={showPassword} onChange={event => setShowPassword(event.target.checked)}/> Show password</label></>}
        <button className="button button-primary auth-button" type="submit" disabled={busy}>{busy ? "Please wait…" : mode === "password" ? "Sign in" : mode === "reset" ? "Email password setup link" : "Email me a sign-in link"}<ArrowRight size={18} aria-hidden="true"/></button>
      </>}
      {error && <p id="login-error" className="form-error" role="alert">{error}</p>}
      {sent && <button className="plain-button" type="button" onClick={() => setSent(false)}>Use a different email</button>}
    </form>
    <div className="auth-options" aria-label="Other sign-in options">
      {mode !== "reset" && <button className="plain-button" type="button" disabled={busy} onClick={() => changeMode("reset")}>Set up or reset password</button>}
      {mode !== "password" && <button className="plain-button" type="button" disabled={busy} onClick={() => changeMode("password")}>Back to password sign-in</button>}
      {mode !== "link" && <button className="plain-button" type="button" disabled={busy} onClick={() => changeMode("link")}>Use an email sign-in link instead</button>}
    </div>
  </div>;
}
