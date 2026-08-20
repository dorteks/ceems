import type { Metadata } from "next";
import { Geist, Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AppShell } from "./_components/app-shell";
import { RootProvider } from "@/lib/context/root-provider";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CEEMS — Customer & Electricity Enumeration Management",
  description:
    "Centralized platform for managing electricity customers, meters, network assets and field enumeration at scale.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${plusJakartaSans.className} bg-background text-foreground min-h-screen antialiased`}
      >
        <RootProvider>
          <AppShell>{children}</AppShell>
        </RootProvider>
      </body>
    </html>
  );
}
