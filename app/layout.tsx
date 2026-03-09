import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { GeistSans } from "geist/font/sans";

import "@/app/globals.css";
import "@/app/scrutinix.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AppToaster } from "@/components/ui/sonner";
import { getSiteUrl } from "@/lib/site-url";

const siteUrl = getSiteUrl();

const hack = localFont({
  src: [
    {
      path: "../public/fonts/hack-regular.woff2",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-hack",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Scrutinix — Multi-Signal URL Threat Analyzer",
  description:
    "Stream 8 independent security signals in real-time to classify URLs as safe, suspicious, malicious, or critical.",
  openGraph: {
    title: "Scrutinix — Multi-Signal URL Threat Analyzer",
    description:
      "Streamed multi-signal malicious URL analysis for suspicious links.",
    url: siteUrl,
    siteName: "Scrutinix",
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Scrutinix — Multi-Signal URL Threat Analyzer",
    description:
      "Streamed multi-signal malicious URL analysis for suspicious links.",
    images: ["/opengraph-image"],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#080c10" },
    { media: "(prefers-color-scheme: light)", color: "#f3f7fb" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${GeistSans.variable} ${hack.variable}`}>
        <a href="#main-content" className="sx-skip-link">
          Skip to content
        </a>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="scrutinix-theme">{children}</div>
          <AppToaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
