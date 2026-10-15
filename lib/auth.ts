import { adminClient, userClient } from "./supabase";

export async function getActor() {
  const supabase = await userClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user?.email) return null;
  const admin = adminClient();
  const { data: profile } = await admin.from("profiles").select("role").eq("id", user.id).single();
  return { id: user.id, email: user.email.toLowerCase(), role: profile?.role === "staff" ? "staff" as const : "client" as const };
}

export async function accessibleClient(clientId: string) {
  const actor = await getActor();
  if (!actor) return null;
  const admin = adminClient();
  const { data: client } = await admin.from("clients").select("id,name,email,box_folder_id,created_at").eq("id", clientId).single();
  if (!client) return null;
  if (actor.role !== "staff" && client.email.toLowerCase() !== actor.email) return null;
  return { actor, client };
}
