import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { Providers } from "./providers";
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
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://memeroast.xyz",
  ),
  title: "MemeRoast",
  description: "AI meme and social entertainment agent on Arc Testnet.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    description: "AI meme and roast agent powered by Arc Testnet and USDC.",
    siteName: "MemeRoast",
    title: "MemeRoast",
    type: "website",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    description: "AI meme and roast agent powered by Arc Testnet and USDC.",
    title: "MemeRoast",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

