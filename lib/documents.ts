import { adminClient, userClient } from "./supabase";
import type { accessibleClient } from "./auth";

type Access = NonNullable<Awaited<ReturnType<typeof accessibleClient>>>;
export const DOCUMENT_BUCKET = "Client-Documents";
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Only staff use the service client. Clients always use their session and Storage RLS.
export async function documentStorage(access: Access) {
  return (access.actor.role === "staff" ? adminClient() : await userClient()).storage.from(DOCUMENT_BUCKET);
}

export function documentPath(access: Access, fileId: string) {
  if (!access.client.auth_user_id || !/^[0-9a-f-]{36}_[a-zA-Z0-9._-]+$/.test(fileId)) throw new Error("Invalid document");
  return `${access.client.auth_user_id}/${fileId}`;
}

export async function listFiles(access: Access) {
  if (!access.client.auth_user_id) throw new Error("Client account not linked");
  const storage = await documentStorage(access);
  const files = [];
  for (let offset = 0; ; offset += 100) {
    const { data, error } = await storage.list(access.client.auth_user_id, { limit: 100, offset, sortBy: { column: "created_at", order: "desc" } });
    if (error) throw error;
    files.push(...data.filter(file => file.id).map(file => ({
      id: file.name, name: file.name.replace(/^[0-9a-f-]{36}_/, ""),
      size: Number(file.metadata?.size || 0), modified_at: file.updated_at,
    })));
    if (data.length < 100) return files;
  }
}
