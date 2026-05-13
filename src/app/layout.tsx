import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.NEXT_PUBLIC_APP_URL ??
  "https://chat.devfrend.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Devfrend — AI Customer Support That Knows Your Business",
    template: "%s · Devfrend",
  },
  description:
    "Multi-tenant RAG chatbot platform with an embeddable widget. Upload your content, embed one script tag, answer customers 24/7 with answers grounded in YOUR docs.",
  applicationName: "Devfrend Chat",
  authors: [{ name: "Amar Gupta", url: "https://amargupta.tech" }],
  creator: "Amar Gupta",
  publisher: "Amar Gupta",
  keywords: [
    "RAG chatbot",
    "AI customer support",
    "embeddable chat widget",
    "multi-tenant SaaS",
    "pgvector",
    "Claude API",
    "Next.js 16",
    "Supabase",
    "Amar Gupta",
    "portfolio",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Devfrend Chat",
    title: "Devfrend — AI Customer Support That Knows Your Business",
    description:
      "Multi-tenant RAG chatbot platform with embeddable widget. Built by Amar Gupta.",
    url: SITE_URL,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Devfrend — AI Customer Support That Knows Your Business",
    description:
      "Multi-tenant RAG chatbot platform with embeddable widget. A dogfooded portfolio piece by Amar Gupta.",
    creator: "@theamargupta",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Amar Gupta",
  url: "https://amargupta.tech",
  email: "mailto:theamargupta.tech@gmail.com",
  jobTitle: "AI-Powered Full-Stack Engineer",
  description:
    "Senior full-stack engineer specialising in RAG pipelines, MCP server design, LLM integration, and multi-tenant SaaS infrastructure.",
  sameAs: [
    "https://amargupta.tech",
    "https://www.linkedin.com/in/theamargupta/",
    "https://github.com/theamargupta",
  ],
  knowsAbout: [
    "Retrieval-Augmented Generation",
    "pgvector",
    "Model Context Protocol",
    "TypeScript",
    "Next.js",
    "Supabase",
    "Postgres Row-Level Security",
    "LLM streaming",
  ],
};

const softwareApplicationJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Devfrend Chat",
  url: SITE_URL,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "Multi-tenant RAG chatbot platform with an embeddable widget. Upload your content, embed one script tag, answer customers 24/7.",
  author: { "@type": "Person", name: "Amar Gupta", url: "https://amargupta.tech" },
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
  },
};

const webSiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Devfrend Chat",
  url: SITE_URL,
  publisher: { "@type": "Person", name: "Amar Gupta", url: "https://amargupta.tech" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteJsonLd) }}
        />
      </body>
    </html>
  );
}
