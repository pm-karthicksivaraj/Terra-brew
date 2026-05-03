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
  title: "Terra Brew | Coffee Traceability Software & EUDR Compliance Platform — Farm to Cup",
  description:
    "Terra Brew is the #1 coffee traceability software — EUDR compliant, blockchain-secured supply chain management platform for coffee producers, exporters, cooperatives & certification bodies. Trusted across Vietnam, Brazil, Ethiopia & Kenya.",
  keywords: [
    "coffee traceability software",
    "EUDR compliance platform",
    "coffee supply chain management",
    "farm to cup traceability",
    "blockchain coffee supply chain",
    "coffee certification management",
    "deforestation risk assessment",
    "coffee cooperative platform",
    "coffee exporter compliance",
    "EUDR due diligence software",
    "coffee origin verification",
    "coffee traceability platform",
    "multi-tenant coffee SaaS",
    "Vietnam coffee supply chain",
    "Brazil coffee traceability",
    "Ethiopia coffee compliance",
    "Kenya coffee cooperative management",
    "QR code coffee traceability",
    "fair trade coffee traceability",
    "Rainforest Alliance certification management",
  ],
  icons: {
    icon: "/logo.svg",
    apple: "/icon-192.png",
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "Terra Brew | #1 Coffee Traceability & EUDR Compliance Software",
    description:
      "EUDR compliant, blockchain-secured coffee supply chain management. Trusted by cooperatives, exporters and certification bodies globally. Farm to cup traceability.",
    type: "website",
    locale: "en_US",
    url: "https://terrabrew.io/",
    siteName: "Terra Brew",
    images: [
      {
        url: "https://terrabrew.io/og-image.png",
        width: 1200,
        height: 630,
        alt: "Terra Brew — Coffee Traceability & EUDR Compliance Software",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Terra Brew | Coffee Traceability & EUDR Compliance Software",
    description:
      "EUDR compliant, blockchain-secured coffee supply chain software. Farm to cup traceability for producers, exporters & certification bodies.",
    images: ["https://terrabrew.io/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://terrabrew.io/",
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
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Terra Brew",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description:
      "EUDR compliant coffee traceability and supply chain management platform for producers, exporters, cooperatives and certification bodies. Farm to cup blockchain-secured tracking.",
    url: "https://terrabrew.io/",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      description: "Free Trial Available",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      reviewCount: "120",
    },
    keywords:
      "coffee traceability, EUDR compliance, coffee supply chain, farm to cup, blockchain coffee, coffee certification management, deforestation risk assessment",
    featureList:
      "Farm-to-cup traceability, EUDR compliance automation, blockchain verification, satellite deforestation monitoring, certification management, procurement & processing pipeline, RFQ & trading desk, multi-entity RBAC",
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is EUDR compliance for coffee exporters?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "EUDR (EU Deforestation Regulation) compliance requires coffee exporters to prove that their products do not originate from recently deforested land. Terra Brew automates this by providing satellite-based deforestation monitoring, GPS-verified farm geolocation, and automated due diligence statement generation for seamless EU market access.",
        },
      },
      {
        "@type": "Question",
        name: "How does blockchain improve coffee supply chain traceability?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Blockchain technology creates an immutable, tamper-proof record of every supply chain event — from planting and harvesting to processing and export. Each transaction is cryptographically linked as a hash-chain block, making it impossible to alter historical data. This builds trust among producers, exporters, certification bodies, and consumers who can verify coffee origin via QR codes.",
        },
      },
      {
        "@type": "Question",
        name: "Which certifications does Terra Brew support?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Terra Brew supports Organic, Fair Trade, Rainforest Alliance, UTZ, and custom certification programs. The platform manages the full certification lifecycle including assessment scheduling, compliance scoring per farm, renewal tracking, and digital audit trails for certification bodies.",
        },
      },
      {
        "@type": "Question",
        name: "Is Terra Brew suitable for small coffee cooperatives?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, Terra Brew is designed for organizations of all sizes. Small cooperatives benefit from affordable starter plans, multi-farmer procurement management, mobile money integration, and simplified EUDR compliance tools. The platform supports multiple languages including Vietnamese, Portuguese, Amharic, and Swahili to serve cooperatives across Vietnam, Brazil, Ethiopia, and Kenya.",
        },
      },
      {
        "@type": "Question",
        name: "How does Terra Brew help with deforestation risk assessment?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Terra Brew uses satellite imagery analysis and land-use change detection to automatically score deforestation risk for every farm plot. GPS-verified geolocation data is cross-referenced with historical satellite data to prove zero-deforestation sourcing, generating verifiable evidence required for EUDR compliance and due diligence statements.",
        },
      },
    ],
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      </head>
      <body
        className={`${spaceMono.variable} antialiased bg-background text-foreground`}
        suppressHydrationWarning
      >
        <ClientApp>{children}</ClientApp>
      </body>
    </html>
  );
}
