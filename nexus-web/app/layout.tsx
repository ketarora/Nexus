import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.css";
import { MockProvider } from "../components/MockProvider";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "NEXUS — Hospitality Crisis Intelligence",
  description:
    "AI-powered emergency response platform connecting guests, staff, and managers in real-time for rapid hospitality crisis coordination.",
  keywords: ["emergency response", "hospitality", "AI", "crisis management", "Gemini"],
  authors: [{ name: "NEXUS Team" }],
  openGraph: {
    title: "NEXUS — Hospitality Crisis Intelligence",
    description: "Real-time AI crisis coordination for hotels",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="theme-color" content="#0052FF" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className={`${inter.className} antialiased bg-nx-bg text-nx-ink`}>
        <MockProvider>
          {children}
        </MockProvider>
      </body>
    </html>
  );
}
