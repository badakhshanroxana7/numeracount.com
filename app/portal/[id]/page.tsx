import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Download, FileText, FolderOpen, LockKeyhole, ShieldCheck } from "lucide-react";
import { accessibleClient, getActor } from "@/lib/auth";
import { listFiles } from "@/lib/box";
import UploadForm from "./upload-form";

export const dynamic = "force-dynamic";

function displaySize(bytes: number) { return bytes < 1024 ? `${bytes} B` : bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`; }

export default async function ClientSpace({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const actor = await getActor();
  if (!actor) redirect("/login");
  const access = await accessibleClient(id);
  if (!access) notFound();
  let files: Awaited<ReturnType<typeof listFiles>> = [];
  let fileError = false;
  try { files = await listFiles(access.client.box_folder_id); } catch { fileError = true; }
  return <main className="portal-layout"><aside className="portal-sidebar"><Link href="/" className="brand"><span className="brand-mark">n<span>.</span></span><span>numera<span className="brand-light">count</span></span></Link><div className="sidebar-section">WORKSPACE</div><Link href="/portal" className="sidebar-link active"><FolderOpen size={18}/> Documents</Link><div className="sidebar-bottom"><div className="sidebar-secure"><ShieldCheck size={20}/><div><strong>Private workspace</strong><span>Only authorized people can access your files.</span></div></div><form action="/api/auth/signout" method="post"><button className="signout-button">Sign out</button></form></div></aside><div className="portal-content"><header className="portal-header"><span>Client portal</span><span className="user-pill">{actor.email.slice(0,1).toUpperCase()}</span></header><div className="portal-main"><Link href="/portal" className="back-link"><ArrowLeft size={16}/> All spaces</Link><div className="space-header"><div><span className="section-kicker">PRIVATE DOCUMENT SPACE</span><h1>{access.client.name}</h1><p>{actor.role === "staff" ? access.client.email : "Only you and the Numeracount team can access these documents."}</p></div><UploadForm clientId={id}/></div><div className="file-panel"><div className="file-panel-title"><h2>Documents <span>{files.length}</span></h2><span><LockKeyhole size={14}/> Private</span></div>{fileError ? <div className="empty-state compact"><h3>Files are unavailable right now</h3><p>Check the Box connection and try again.</p></div> : files.length ? <div className="file-list">{files.map((file) => <div className="file-row" key={file.id}><span className="file-icon"><FileText size={20}/></span><div className="file-info"><strong>{file.name}</strong><span>{displaySize(file.size || 0)}{file.modified_at ? ` · Updated ${new Date(file.modified_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}` : ""}</span></div><a className="download-button" href={`/api/clients/${id}/files/${file.id}`} aria-label={`Download ${file.name}`}><Download size={18}/></a></div>)}</div> : <div className="empty-state compact"><div className="empty-icon"><FileText size={30}/></div><h3>No documents yet</h3><p>Upload the first file to get started.</p></div>}</div><div className="portal-assurance"><ShieldCheck size={17}/> Documents in this space are stored with Box and restricted to authorized access.</div></div></div></main>;
}
