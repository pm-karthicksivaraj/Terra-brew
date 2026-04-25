import type { Metadata, Viewport } from "next";
import { Space_Mono } from "next/font/google";
import Script from "next/script";
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
  description:
    "End-to-End Coffee Traceability Platform — Multi-tenant, RBAC, Blockchain-verified",
  icons: {
    icon: "/logo.svg",
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
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#6B4226" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body
        className={`${spaceMono.variable} antialiased bg-background text-foreground`}
        style={{ fontFamily: '"Space Mono", monospace' }}
        suppressHydrationWarning
      >
        <Providers>{children}</Providers>
        <Script id="pwa-register" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js', { scope: '/' })
                  .then(function(reg) {
                    console.log('[Terra Brew PWA] Service Worker registered:', reg.scope);

                    // Listen for updates
                    reg.addEventListener('updatefound', function() {
                      var newWorker = reg.installing;
                      if (newWorker) {
                        newWorker.addEventListener('statechange', function() {
                          if (newWorker.state === 'activated' && navigator.serviceWorker.controller) {
                            console.log('[Terra Brew PWA] New Service Worker activated.');
                          }
                        });
                      }
                    });
                  })
                  .catch(function(err) {
                    console.warn('[Terra Brew PWA] Service Worker registration failed:', err);
                  });
              });

              // Replay sync queue when coming back online
              window.addEventListener('online', function() {
                if (navigator.serviceWorker.controller) {
                  navigator.serviceWorker.controller.postMessage({ type: 'REPLAY_SYNC_QUEUE' });
                }
              });
            }
          `}
        </Script>
      </body>
    </html>
  );
}
