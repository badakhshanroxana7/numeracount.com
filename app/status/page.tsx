import Link from "next/link";
import { ArrowLeft, LockKeyhole } from "lucide-react";

export default function StatusPage() {
  return <main className="auth-layout"><div className="auth-side"><Link href="/" className="brand brand-white"><span className="brand-mark">n<span>.</span></span><span>numera<span className="brand-light">count</span></span></Link><div className="auth-side-content"><span className="auth-label">CLIENT PORTAL</span><h1>A private space is on its way.</h1><p>We’re connecting and testing secure document exchange before opening it to clients.</p></div></div><div className="auth-main"><Link href="/" className="back-link"><ArrowLeft size={16}/> Back to home</Link><div className="auth-form-wrap"><div className="auth-icon"><LockKeyhole size={28}/></div><span className="section-kicker">SETUP IN PROGRESS</span><h2>The portal isn’t open yet</h2><p>Please do not send sensitive documents through this website until Numeracount confirms the private portal is ready.</p><Link href="/" className="button button-primary">Return to homepage</Link></div></div></main>;
}
