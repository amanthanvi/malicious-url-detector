import type { Metadata } from "next";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ThemeProvider } from "@/components/layout/theme-provider";
import "@/app/globals.css";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Malicious URL Detector v2",
  description:
    "Stream VirusTotal, Safe Browsing, TLS, DNS, redirect, registration, threat-feed, and ML signals into one modern malicious URL report.",
  openGraph: {
    title: "Malicious URL Detector v2",
    description:
      "Streamed multi-signal malicious URL analysis for suspicious links.",
    url: siteUrl,
    siteName: "Malicious URL Detector",
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Malicious URL Detector v2",
    description:
      "Streamed multi-signal malicious URL analysis for suspicious links.",
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <SiteHeader />
          {children}
          <SiteFooter />
        </ThemeProvider>
      </body>
    </html>
  );
}
