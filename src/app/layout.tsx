import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { SCHOOL } from "@/lib/school";
import { siteUrl } from "@/lib/site-url";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: `${SCHOOL.name} | Best School in ${SCHOOL.location} | Nursery to Class 10`,
    template: `%s | ${SCHOOL.shortName}`,
  },
  description:
    `${SCHOOL.name} — quality education from Nursery to Class 10 in ${SCHOOL.location}. Experienced teachers, modern facilities, caring environment.`,
  openGraph: {
    type: "website",
    siteName: SCHOOL.name,
    title: `${SCHOOL.name} — ${SCHOOL.tagline}`,
    description: `Quality education from Nursery to Class 10 in ${SCHOOL.location}.`,
    locale: "en_NP",
    // og:image is supplied automatically by app/opengraph-image.tsx
  },
  twitter: {
    // Reuses app/opengraph-image.tsx — Next falls back to it when no
    // twitter-image file exists, so there is nothing to duplicate here.
    card: "summary_large_image",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${poppins.variable} font-sans`}>
        {children}
      </body>
    </html>
  );
}
