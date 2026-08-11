import type { Metadata } from "next";
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
  title: "Raju Bhai Ka Saloon",
  description: "Raju Bhai Ka Saloon — a barbershop vibe room with music",
  applicationName: "Raju Bhai Ka Saloon",
  icons: {
    icon: [{ url: "/images/saloon-logo.png", type: "image/png" }],
    shortcut: ["/images/saloon-logo.png"],
    apple: [{ url: "/images/saloon-logo.png" }],
  },
  openGraph: {
    title: "Raju Bhai Ka Saloon",
    description: "Raju Bhai Ka Saloon — a barbershop vibe room with music",
    siteName: "Raju Bhai Ka Saloon",
    images: [{ url: "/images/saloon-logo.png" }],
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Raju Bhai Ka Saloon",
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
      </body>
    </html>
  );
}
