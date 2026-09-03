import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { SCHOOL } from "@/lib/school";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://easternview.edu.np"),
  title: {
    default: `${SCHOOL.name} | Best School in ${SCHOOL.location} | Nursery to Class 10`,
    template: `%s | ${SCHOOL.shortName}`,
  },
  description:
    `${SCHOOL.name} — quality education from Nursery to Class 10 in ${SCHOOL.location}. Experienced teachers, modern facilities, caring environment.`,
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
