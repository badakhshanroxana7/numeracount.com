import Brand from "@/app/components/brand";
import Link from "next/link";
import { ArrowLeft, LockKeyhole } from "lucide-react";

export default function StatusPage() {
  return <main className="auth-layout"><div className="auth-side"><Brand light/><div className="auth-side-content"><span className="auth-label">CLIENT PORTAL</span><h2>A private space is on its way.</h2><p>We’re connecting and testing secure document exchange before opening it to clients.</p></div></div><div className="auth-main" id="main-content" tabIndex={-1}><Link href="/" className="back-link"><ArrowLeft size={16}/> Back to home</Link><div className="auth-form-wrap"><div className="auth-icon"><LockKeyhole size={28}/></div><span className="section-kicker">SETUP IN PROGRESS</span><h1>The portal isn’t open yet</h1><p>Please do not send sensitive documents through this website until Numeracount confirms the private portal is ready.</p><Link href="/" className="button button-primary">Return to homepage</Link></div></div></main>;
}
