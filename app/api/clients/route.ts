import { NextResponse } from "next/server";
import { getActor } from "@/lib/auth";
import { createClientFolder } from "@/lib/box";
import { adminClient } from "@/lib/supabase";

export async function POST(request: Request) {
  const actor = await getActor();
  if (!actor || actor.role !== "staff") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { name, email } = await request.json();
  if (typeof name !== "string" || typeof email !== "string" || !name.trim() || name.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Enter a name and valid email." }, { status: 400 });
  }
  const admin = adminClient();
  const normalizedEmail = email.trim().toLowerCase();
  const { data: existing } = await admin.from("clients").select("id").eq("email", normalizedEmail).maybeSingle();
  if (existing) return NextResponse.json({ error: "A client with this email already exists." }, { status: 409 });
  try {
    const folderId = await createClientFolder(`${name.trim()} - ${crypto.randomUUID()}`);
    const { data, error } = await admin.from("clients").insert({ name: name.trim(), email: normalizedEmail, box_folder_id: folderId }).select("id").single();
    if (error) throw error;
    const { error: inviteError } = await admin.auth.admin.inviteUserByEmail(normalizedEmail);
    return NextResponse.json({ id: data.id, invitationSent: !inviteError }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Could not create client space. Check Box and database settings." }, { status: 500 });
  }
}
