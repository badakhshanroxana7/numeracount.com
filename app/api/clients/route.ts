import { NextResponse } from "next/server";
import { getActor } from "@/lib/auth";
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
    // Invite only from an explicitly authorized staff action. Existing users are
    // resolved without exposing the directory to clients.
    const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(normalizedEmail, { redirectTo: `${new URL(process.env.SITE_URL || request.url).origin}/auth/callback` });
    let userId = invited.user?.id;
    if (!userId) {
      for (let page = 1; ; page++) {
        const { data: users, error } = await admin.auth.admin.listUsers({ page, perPage: 100 });
        if (error) throw error;
        userId = users.users.find(user => user.email?.toLowerCase() === normalizedEmail)?.id;
        if (userId || users.users.length < 100) break;
      }
    }
    if (!userId) throw inviteError || new Error("Unable to link client account");
    const { data, error } = await admin.from("clients").insert({ name: name.trim(), email: normalizedEmail, auth_user_id: userId }).select("id").single();
    if (error) throw error;
    return NextResponse.json({ id: data.id, invitationSent: !inviteError }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Could not create client space. Check invitation delivery and database settings." }, { status: 500 });
  }
}
