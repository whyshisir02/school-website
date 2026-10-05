import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";

import { siteUrl } from "@/lib/site-url";
import { getSiteSettings } from "@/lib/settings";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
});

export async function generateMetadata(): Promise<Metadata> {
  const { name, branding } = await getSiteSettings();
  return {
  metadataBase: new URL(siteUrl()),
  title: {
    default: name,
    template: `%s | ${name}`,
  },
  description: branding.description,
  openGraph: {
    type: "website",
    siteName: name,
    title: `${name} | ${branding.headline}`,
    description: branding.description,
    locale: "en_NP",
    // og:image is supplied automatically by app/opengraph-image.tsx
  },
  twitter: {
    // Reuses app/opengraph-image.tsx — Next falls back to it when no
    // twitter-image file exists, so there is nothing to duplicate here.
    card: "summary_large_image",
  },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className={`${inter.variable} ${poppins.variable} font-sans`}>
        {children}
      </body>
    </html>
  );
}
