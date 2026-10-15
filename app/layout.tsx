import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Numeracount | Secure client portal",
  description: "A private place to exchange important documents with Numeracount.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
