import Brand from "@/app/components/brand";
import Link from "next/link";
import { ArrowLeft, LockKeyhole, ShieldCheck } from "lucide-react";
import LoginForm from "./login-form";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Client Sign In | Numeracount", description: "Sign in to your private Numeracount document space." };

export default function LoginPage() {
  if (process.env.PORTAL_ENABLED !== "true") redirect("/status");
  return <main className="auth-layout"><div className="auth-side"><Brand light/><div className="auth-side-content"><span className="auth-label">YOUR PRIVATE WORKSPACE</span><h2>A simpler way to share what matters.</h2><p>All your important documents, in one secure place with your Numeracount team.</p><div className="auth-side-card"><ShieldCheck size={25}/><div><strong>Private by design</strong><span>Your space is accessible only to you and authorized staff.</span></div></div></div><div className="auth-side-bottom">Thoughtful tools for better collaboration.</div></div><div className="auth-main" id="main-content" tabIndex={-1}><Link href="/" className="back-link"><ArrowLeft size={16}/> Back to home</Link><div className="auth-form-wrap"><div className="auth-icon"><LockKeyhole size={28}/></div><span className="section-kicker">WELCOME BACK</span><h1>Sign in to your portal</h1><p>Enter your email and we’ll send you a secure sign-in link.</p><LoginForm/><div className="auth-note"><ShieldCheck size={16}/> Your access is protected with a one-time link.</div></div><div className="auth-help">Need access? Contact your Numeracount team.</div></div></main>;
}
