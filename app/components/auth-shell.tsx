import Link from "next/link";
import { ArrowLeft, LockKeyhole, ShieldCheck } from "lucide-react";
import Brand from "./brand";

export default function AuthShell({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return <main className="auth-layout">
    <div className="auth-side"><Brand light/><div className="auth-side-content"><span className="auth-label">YOUR PRIVATE WORKSPACE</span><h2>A simpler way to share what matters.</h2><p>All your important documents, in one secure place with your Numeracount team.</p><div className="auth-side-card"><ShieldCheck size={25} aria-hidden="true"/><div><strong>Private by design</strong><span>Your space is accessible only to you and authorized staff.</span></div></div></div><div className="auth-side-bottom">Thoughtful tools for better collaboration.</div></div>
    <div className="auth-main" id="main-content" tabIndex={-1}><Link href="/" className="back-link"><ArrowLeft size={16} aria-hidden="true"/> Back to home</Link><div className="auth-form-wrap"><div className="auth-icon"><LockKeyhole size={28} aria-hidden="true"/></div><span className="section-kicker">NUMERACOUNT CLIENT PORTAL</span><h1>{title}</h1><p>{description}</p>{children}<div className="auth-note"><ShieldCheck size={16} aria-hidden="true"/> Your documents remain restricted to you and authorized staff.</div></div><div className="auth-help">Need access? Contact your Numeracount team.</div></div>
  </main>;
}
