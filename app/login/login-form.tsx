"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const response = await fetch(step === "email" ? "/api/auth/send-code" : "/api/auth/verify-code", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, code }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Something went wrong.");
      if (step === "email") setStep("code"); else { router.push("/portal"); router.refresh(); }
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Something went wrong."); }
    finally { setBusy(false); }
  }

  return <form className="auth-form" onSubmit={submit}><label htmlFor={step === "email" ? "email" : "code"}>{step === "email" ? "Email address" : `Code sent to ${email}`}</label>{step === "email" ? <input id="email" type="email" autoComplete="email" required placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)}/> : <input id="code" inputMode="numeric" autoComplete="one-time-code" required placeholder="Enter your code" minLength={6} maxLength={8} value={code} onChange={(event) => setCode(event.target.value)}/ >}{error && <p className="form-error" role="alert">{error}</p>}<button className="button button-primary auth-button" type="submit" disabled={busy}>{busy ? "Please wait…" : step === "email" ? "Send sign-in code" : "Verify and sign in"}<ArrowRight size={18}/></button>{step === "code" && <button className="plain-button" type="button" onClick={() => { setStep("email"); setCode(""); }}>Use a different email</button>}</form>;
}
