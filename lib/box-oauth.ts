import "server-only";
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { adminClient } from "./supabase";
import { requiredEnv } from "./env";

function key() {
  const raw = requiredEnv("BOX_TOKEN_ENCRYPTION_KEY");
  if (!/^[a-f0-9]{64}$/i.test(raw)) throw new Error("BOX_TOKEN_ENCRYPTION_KEY must be 64 hex characters");
  return Buffer.from(raw, "hex");
}

function encrypt(value: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const ciphertext = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), ciphertext]).toString("base64url");
}

function decrypt(value: string) {
  const input = Buffer.from(value, "base64url");
  const decipher = createDecipheriv("aes-256-gcm", key(), input.subarray(0, 12));
  decipher.setAuthTag(input.subarray(12, 28));
  return Buffer.concat([decipher.update(input.subarray(28)), decipher.final()]).toString("utf8");
}

type TokenResponse = { access_token: string; refresh_token: string; expires_in: number };

async function tokenRequest(body: URLSearchParams): Promise<TokenResponse> {
  const response = await fetch("https://api.box.com/oauth2/token", { method: "POST", body, cache: "no-store" });
  if (!response.ok) throw new Error(`Box authentication failed (${response.status})`);
  return response.json();
}

function tokenFields(tokens: TokenResponse) {
  return {
    access_token: encrypt(tokens.access_token),
    refresh_token: encrypt(tokens.refresh_token),
    expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  };
}

async function saveTokens(tokens: TokenResponse) {
  const { error } = await adminClient().from("box_connection").upsert({
    id: "primary",
    ...tokenFields(tokens),
  });
  if (error) throw new Error("Could not save Box connection");
}

export async function connectBox(code: string, redirectUri: string) {
  const tokens = await tokenRequest(new URLSearchParams({
    grant_type: "authorization_code",
    code,
    client_id: requiredEnv("BOX_CLIENT_ID"),
    client_secret: requiredEnv("BOX_CLIENT_SECRET"),
    redirect_uri: redirectUri,
  }));
  await saveTokens(tokens);
}

export async function boxConnected() {
  const { data } = await adminClient().from("box_connection").select("root_folder_id").eq("id", "primary").maybeSingle();
  return Boolean(data?.root_folder_id);
}

export async function boxRootFolderId() {
  const { data, error } = await adminClient().from("box_connection").select("root_folder_id").eq("id", "primary").single();
  if (error || !data?.root_folder_id) throw new Error("Box client folder is not ready");
  return data.root_folder_id as string;
}

export async function setBoxRootFolderId(id: string) {
  const { error } = await adminClient().from("box_connection").update({ root_folder_id: id }).eq("id", "primary");
  if (error) throw new Error("Could not save Box folder");
}

export async function boxAccessToken(): Promise<string> {
  const admin = adminClient();
  const { data, error } = await admin.from("box_connection").select("access_token,refresh_token,expires_at").eq("id", "primary").single();
  if (error || !data) throw new Error("Box is not connected");
  if (new Date(data.expires_at).getTime() > Date.now() + 90_000) return decrypt(data.access_token);
  try {
    const tokens = await tokenRequest(new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: decrypt(data.refresh_token),
      client_id: requiredEnv("BOX_CLIENT_ID"),
      client_secret: requiredEnv("BOX_CLIENT_SECRET"),
    }));
    const { data: updated, error: updateError } = await admin.from("box_connection")
      .update(tokenFields(tokens)).eq("id", "primary").eq("refresh_token", data.refresh_token).select("id").maybeSingle();
    if (updateError) throw updateError;
    if (updated) return tokens.access_token;
  } catch {
    // Another request may have rotated the one-use refresh token.
  }
  const { data: latest, error: latestError } = await admin.from("box_connection")
    .select("access_token,refresh_token,expires_at").eq("id", "primary").single();
  if (!latestError && latest && latest.refresh_token !== data.refresh_token && new Date(latest.expires_at).getTime() > Date.now()) {
    return decrypt(latest.access_token);
  }
  throw new Error("Box connection expired; reconnect Box from the staff portal");
}
