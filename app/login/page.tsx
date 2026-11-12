import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AuthShell from "@/app/components/auth-shell";
import LoginForm from "./login-form";

export const metadata: Metadata = { title: "Client Sign In | Numeracount", description: "Sign in to your private Numeracount document space with your email and password." };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ mode?: string; error?: string }> }) {
  if (process.env.PORTAL_ENABLED !== "true") redirect("/status");
  const params = await searchParams;
  return <AuthShell title="Sign in to your portal" description="Use your email address and password. Setting a password for the first time? Choose Set up or reset password below.">
    <LoginForm initialMode={params.mode === "reset" ? "reset" : "password"} initialError={params.error === "link"}/>
  </AuthShell>;
}
