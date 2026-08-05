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
  title: "Atlas — кандидат и состояние системы",
  description: "Понятный статус Atlas: работает ли система, как торгует кандидат и может ли он стать чемпионом.",
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
    title: "Atlas — кандидат и состояние системы",
    description: "Работает ли система, как торгует кандидат и может ли он стать чемпионом.",
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
