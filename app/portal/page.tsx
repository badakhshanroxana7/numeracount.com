import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, FileText, FolderOpen, LockKeyhole, ShieldCheck } from "lucide-react";
import { getActor } from "@/lib/auth";
import { adminClient } from "@/lib/supabase";
import AddClient from "./add-client";
import { boxConnected } from "@/lib/box-oauth";

export const dynamic = "force-dynamic";

export default async function PortalPage() {
  const actor = await getActor();
  if (!actor) redirect("/login");
  const admin = adminClient();
  const connected = actor.role === "staff" ? await boxConnected() : true;
  const query = admin.from("clients").select("id,name,email,created_at").order("created_at", { ascending: false });
  const { data: clients, error } = actor.role === "staff" ? await query : await query.eq("email", actor.email);
  return <main className="portal-layout"><aside className="portal-sidebar"><Link href="/" className="brand"><span className="brand-mark">n<span>.</span></span><span>numera<span className="brand-light">count</span></span></Link><div className="sidebar-section">WORKSPACE</div><div className="sidebar-link active"><FolderOpen size={18}/> Documents</div><div className="sidebar-bottom"><div className="sidebar-secure"><ShieldCheck size={20}/><div><strong>Private workspace</strong><span>Only authorized people can access your files.</span></div></div><form action="/api/auth/signout" method="post"><button className="signout-button">Sign out</button></form></div></aside><div className="portal-content"><header className="portal-header"><span>Client portal</span><span className="user-pill">{actor.email.slice(0,1).toUpperCase()}</span></header><div className="portal-main"><div className="portal-welcome"><span className="section-kicker">YOUR WORKSPACE</span><h1>{actor.role === "staff" ? "Client spaces" : "Your documents"}</h1><p>{actor.role === "staff" ? "Manage private spaces and exchange documents with your clients." : "Your private space for sharing documents with the Numeracount team."}</p></div>{actor.role === "staff" && (!connected ? <div className="notice-card">Connect your Box account before creating client spaces. <Link href="/api/box/connect" className="button button-primary">Connect Box <ArrowRight size={16}/></Link></div> : <AddClient/>)}{error ? <div className="notice-card">Unable to load spaces. Check the database setup.</div> : clients?.length ? <div className="client-grid">{clients.map((client) => <Link className="client-card" key={client.id} href={`/portal/${client.id}`}><span className="client-icon"><FolderOpen size={26}/></span><h2>{client.name}</h2><p>{client.email}</p><span className="client-card-link">Open space <ArrowRight size={17}/></span></Link>)}</div> : <div className="empty-state"><div className="empty-icon"><FileText size={32}/></div><h2>{actor.role === "staff" ? "No client spaces yet" : "Your space is being prepared"}</h2><p>{actor.role === "staff" ? "Create a client space to begin securely exchanging documents." : "Contact your Numeracount team if you need access to a document space."}</p></div>}<div className="portal-assurance"><LockKeyhole size={17}/> Your documents are private and stored with Box.</div></div></div></main>;
}
