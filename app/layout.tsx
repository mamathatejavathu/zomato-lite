import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import TopBar from "@/components/TopBar";
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
  title: "Zomato Lite",
  description: "Reviews for Ludhiana Burrito",
};

export const viewport = {
  themeColor: "#141414",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-[#141414] text-[#f4f4f5] antialiased`}
      >
        <TopBar />
        {children}
      </body>
    </html>
  );
}
