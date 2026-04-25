import type { Metadata } from "next";
import { Space_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Terra Brew — Nền tảng Truy xuất Nguồn gốc Cà phê",
  description: "End-to-End Coffee Traceability Platform — Multi-tenant, RBAC, Blockchain-verified",
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${spaceMono.variable} antialiased bg-background text-foreground`} style={{ fontFamily: '"Space Mono", monospace' }}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
