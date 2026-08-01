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
  metadataBase: new URL("https://dsimutin.github.io/atlas-crypto-dashboard/"),
  title: "Atlas Crypto System — Readiness",
  description: "Локальная read-only панель доказательств и готовности системы.",
  icons: {
    icon: "/atlas-crypto-dashboard/favicon.svg",
    shortcut: "/atlas-crypto-dashboard/favicon.svg",
  },
  openGraph: {
    title: "Atlas Crypto System — Readiness",
    description: "Read-only контроль доказательств и ограничений.",
    images: ["/atlas-crypto-dashboard/og.png"],
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
