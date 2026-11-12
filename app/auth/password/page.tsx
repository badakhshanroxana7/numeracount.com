import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AuthShell from "@/app/components/auth-shell";
import PasswordForm from "./password-form";

export const metadata: Metadata = { title: "Set Your Password | Numeracount", description: "Choose your own password for your Numeracount client account." };
export default function PasswordPage() {
  if (process.env.PORTAL_ENABLED !== "true") redirect("/status");
  return <AuthShell title="Set your password" description="Choose a password for your account. After saving it, you can sign in with your email and password."><PasswordForm/></AuthShell>;
}
