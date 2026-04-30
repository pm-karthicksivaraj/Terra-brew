import type { Metadata, Viewport } from "next";
import { Space_Mono } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { ClientApp } from "@/components/client-app";

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Terra Brew — Nền tảng Truy xuất Nguồn gốc Cà phê",
  description:
    "End-to-End Coffee Traceability Platform — Multi-tenant, RBAC, Blockchain-verified",
  icons: {
    icon: "/logo.svg",
    apple: "/icon-192.png",
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#6B4226",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body
        className={`${spaceMono.variable} antialiased bg-background text-foreground`}
        style={{ fontFamily: '"Space Mono", monospace' }}
        suppressHydrationWarning
      >
        <ClientApp>{children}</ClientApp>
      </body>
    </html>
  );
}
