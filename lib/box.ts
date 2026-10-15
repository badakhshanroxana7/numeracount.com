import { boxAccessToken, boxRootFolderId, setBoxRootFolderId } from "./box-oauth";

type BoxItem = { id: string; type: "file" | "folder"; name: string; size?: number; modified_at?: string; parent?: { id: string } };

async function boxFetch(path: string, init: RequestInit = {}, upload = false) {
  const token = await boxAccessToken();
  const base = upload ? "https://upload.box.com/api/2.0" : "https://api.box.com/2.0";
  const response = await fetch(`${base}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, ...init.headers },
    cache: "no-store",
    redirect: "manual",
  });
  if (!response.ok && !(path.endsWith("/content") && response.status === 302)) {
    throw new Error(`Box request failed (${response.status})`);
  }
  return response;
}

export async function createClientFolder(name: string) {
  const response = await boxFetch("/folders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, parent: { id: await boxRootFolderId() } }),
  });
  return (await response.json()).id as string;
}

export async function ensurePortalRootFolder() {
  try { return await boxRootFolderId(); } catch { /* A new connection has no root folder yet. */ }
  const response = await boxFetch("/folders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Numeracount Client Portal", parent: { id: "0" } }),
  });
  const id = (await response.json()).id as string;
  await setBoxRootFolderId(id);
  return id;
}

export async function listFiles(folderId: string): Promise<BoxItem[]> {
  const response = await boxFetch(`/folders/${encodeURIComponent(folderId)}/items?fields=id,type,name,size,modified_at&limit=1000`);
  const data = await response.json();
  return (data.entries as BoxItem[]).filter((item) => item.type === "file");
}

export async function uploadFile(folderId: string, file: File) {
  const form = new FormData();
  form.append("attributes", JSON.stringify({ name: file.name, parent: { id: folderId } }));
  form.append("file", file);
  await boxFetch("/files/content", { method: "POST", body: form }, true);
}

export async function downloadFile(folderId: string, fileId: string) {
  const metadata = await boxFetch(`/files/${encodeURIComponent(fileId)}?fields=id,name,size,parent`);
  const file = await metadata.json() as BoxItem;
  if (file.parent?.id !== folderId) return null;
  const response = await boxFetch(`/files/${encodeURIComponent(fileId)}/content`);
  const location = response.headers.get("location");
  const host = location ? new URL(location).hostname : "";
  if (!location || !location.startsWith("https://") || !["box.com", "boxcloud.com"].some((domain) => host === domain || host.endsWith(`.${domain}`))) throw new Error("Box did not provide a secure download URL");
  const content = await fetch(location, { cache: "no-store" });
  if (!content.ok || !content.body) throw new Error(`Box download failed (${content.status})`);
  return { file, content };
}
