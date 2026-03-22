import type { Metadata } from "next";
import { Inter, Caveat } from "next/font/google";
import Script from "next/script";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "./providers";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const caveat = Caveat({
  variable: "--font-cursive",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mehfil — Cultural Event Platform",
  description:
    "Discover, organize, and celebrate cultural events. From poetry to music, dance to theater — Mehfil brings culture alive.",
  keywords: [
    "cultural events",
    "poetry",
    "music",
    "dance",
    "theater",
    "mehfil",
    "events",
    "booking",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${caveat.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="beforeInteractive" />
      </head>
      <body className="min-h-full flex flex-col">
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <Toaster richColors position="top-right" />
        </Providers>
      </body>
    </html>
  );
}
