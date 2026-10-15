import Link from "next/link";
import { ArrowLeft, LockKeyhole, ShieldCheck } from "lucide-react";
import LoginForm from "./login-form";
import { redirect } from "next/navigation";

export default function LoginPage() {
  if (process.env.PORTAL_ENABLED !== "true") redirect("/status");
  return <main className="auth-layout"><div className="auth-side"><Link href="/" className="brand brand-white"><span className="brand-mark">n<span>.</span></span><span>numera<span className="brand-light">count</span></span></Link><div className="auth-side-content"><span className="auth-label">YOUR PRIVATE WORKSPACE</span><h1>A simpler way to share what matters.</h1><p>All your important documents, in one secure place with your Numeracount team.</p><div className="auth-side-card"><ShieldCheck size={25}/><div><strong>Private by design</strong><span>Your space is accessible only to you and authorized staff.</span></div></div></div><div className="auth-side-bottom">Thoughtful tools for better collaboration.</div></div><div className="auth-main"><Link href="/" className="back-link"><ArrowLeft size={16}/> Back to home</Link><div className="auth-form-wrap"><div className="auth-icon"><LockKeyhole size={28}/></div><span className="section-kicker">WELCOME BACK</span><h2>Sign in to your portal</h2><p>Enter your email and we’ll send you a secure sign-in link.</p><LoginForm/><div className="auth-note"><ShieldCheck size={16}/> Your access is protected with a one-time link.</div></div><div className="auth-help">Need access? Contact your Numeracount team.</div></div></main>;
}
