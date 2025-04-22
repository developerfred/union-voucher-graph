import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { FarcasterProvider } from "./components/FarcasterProvider";

// Import fonts with Latin subset for better performance
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap", // Add swap for better performance
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap", // Add swap for better performance
});

export const metadata: Metadata = {
  title: "Union Voucher Graph - Explore the Vouching Network",
  description: "Interactive visualization of the Union protocol's vouching network showing relationships and connections between participants.",
  keywords: "Union protocol, vouching network, blockchain, decentralized finance, trust graph, visualization",
  authors: [{ name: "developerfred" }],
  openGraph: {
    title: "Union Voucher Graph",
    description: "Interactive visualization of the Union protocol's vouching network",
    url: "https://union-vouch.aipop.fun",
    siteName: "Union Voucher Graph",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Union Voucher Graph Preview"
      }
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Union Voucher Graph",
    description: "Interactive visualization of the Union protocol's vouching network",
    images: ["/opengraph-image.png"],
  },
  metadataBase: new URL("https://union-vouch.aipop.fun"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Add preconnect for external resources */}
        <link rel="preconnect" href="https://subgraph.satsuma-prod.com" />
        <link rel="dns-prefetch" href="https://subgraph.satsuma-prod.com" />

        {/* Add favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />

        {/* Preload critical assets */}
        <link rel="preload" href="/logo.png" as="image" />

        <meta name="fc:frame" content='{"version":"next","imageUrl":"https://union-vouch.aipop.fun/opengraph-image","button":{"title":"🔍 Explore Graph","action":{"type":"launch_frame","name":"Union Vouch Graph","url":"https://union-vouch.aipop.fun","splashImageUrl":"https://union-vouch.aipop.fun/splash.svg","splashBackgroundColor":"#2563eb"}}}' />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <FarcasterProvider>
        {children}
        </FarcasterProvider>
      </body>
    </html>
  );
}