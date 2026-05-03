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
  title: "Terra Brew — End-to-End Coffee Traceability Platform",
  description:
    "Terra Brew is the leading multi-tenant coffee traceability platform. Blockchain-verified supply chain tracking, EUDR compliance, multi-entity RBAC, and real-time analytics for coffee producers, aggregators, exporters, and importers worldwide.",
  keywords: [
    "coffee traceability",
    "EUDR compliance",
    "supply chain tracking",
    "blockchain coffee",
    "coffee traceability platform",
    "farm to cup traceability",
    "coffee supply chain management",
    "deforestation-free coffee",
    "coffee quality assurance",
    "sustainable coffee sourcing",
    "coffee producer software",
    "coffee exporter platform",
    "multi-tenant SaaS coffee",
    "coffee farmer management",
    "coffee certification management",
    "EUDR due diligence",
    "coffee ERP",
    "agritech platform",
    "commodity traceability",
    "coffee origin verification",
  ],
  icons: {
    icon: "/logo.svg",
    apple: "/icon-192.png",
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "Terra Brew — Coffee Traceability Platform",
    description: "Blockchain-verified end-to-end coffee traceability. EUDR compliant. Multi-entity. From farm to cup.",
    type: "website",
    locale: "en_US",
    siteName: "Terra Brew",
  },
  twitter: {
    card: "summary_large_image",
    title: "Terra Brew — Coffee Traceability Platform",
    description: "Blockchain-verified end-to-end coffee traceability. EUDR compliant. Multi-entity. From farm to cup.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#6D2932",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${spaceMono.variable} antialiased bg-background text-foreground`}
        suppressHydrationWarning
      >
        <ClientApp>{children}</ClientApp>
      </body>
    </html>
  );
}
