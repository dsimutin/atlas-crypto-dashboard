import type { Metadata } from "next";
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

export const metadata: Metadata = {
  metadataBase: new URL("https://atlas-crypto-dashboard.atlas-crypto-dima.workers.dev/"),
  title: "Atlas — автономный торговый агент",
  description: "Понятное состояние Atlas: результат, готовность, виртуальные позиции и контроль риска.",
  manifest: "/site.webmanifest",
  appleWebApp: {
    capable: true,
    title: "ATLAS",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: "Atlas — автономный торговый агент",
    description: "Результат, готовность, виртуальные позиции и контроль риска.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "ATLAS — автономный торговый агент" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Atlas — автономный торговый агент",
    description: "Результат, готовность, виртуальные позиции и контроль риска.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
