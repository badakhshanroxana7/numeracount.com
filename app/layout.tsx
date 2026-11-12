import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Numeracount | Bookkeeping Services",
  icons: { icon: "/icon.svg" },
  description: "Bookkeeping services from Numeracount. Organized financial records, clear information, and personal support. Contact info@numeracount.com.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><a className="skip-link" href="#main-content">Skip to main content</a>{children}</body></html>;
}
