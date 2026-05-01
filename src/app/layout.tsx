import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { ClientApp } from "@/components/client-app";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
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
  themeColor: "#0D9488",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body
        className={`${inter.variable} antialiased bg-background text-foreground`}
        suppressHydrationWarning
      >
        <ClientApp>{children}</ClientApp>
      </body>
    </html>
  );
}
