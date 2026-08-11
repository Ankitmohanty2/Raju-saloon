import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { DM_Sans, Tiro_Devanagari_Hindi } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const tiroDevanagari = Tiro_Devanagari_Hindi({
  variable: "--font-tiro-devanagari",
  subsets: ["devanagari", "latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_SITE_NAME || "Raju Bhai Ka Saloon",
  description: "Raju Bhai Ka Saloon — a barbershop vibe room with music",
  applicationName: process.env.NEXT_PUBLIC_SITE_NAME || "Raju Bhai Ka Saloon",
  metadataBase: process.env.NEXT_PUBLIC_SITE_URL
    ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
    : undefined,
  icons: {
    icon: [{ url: "/images/saloon-logo.png", type: "image/png" }],
    shortcut: ["/images/saloon-logo.png"],
    apple: [{ url: "/images/saloon-logo.png" }],
  },
  openGraph: {
    title: process.env.NEXT_PUBLIC_SITE_NAME || "Raju Bhai Ka Saloon",
    description: "Raju Bhai Ka Saloon — a barbershop vibe room with music",
    siteName: process.env.NEXT_PUBLIC_SITE_NAME || "Raju Bhai Ka Saloon",
    images: [{ url: "/images/saloon-logo.png" }],
    type: "website",
  },
  twitter: {
    card: "summary",
    title: process.env.NEXT_PUBLIC_SITE_NAME || "Raju Bhai Ka Saloon",
    description: "Raju Bhai Ka Saloon — a barbershop vibe room with music",
    images: ["/images/saloon-logo.png"],
  },
  other: {
    google: "notranslate",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      translate="no"
      className={`notranslate ${dmSans.variable} ${tiroDevanagari.variable} h-full antialiased`}
    >
      <body className="notranslate h-full overflow-hidden font-sans">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
