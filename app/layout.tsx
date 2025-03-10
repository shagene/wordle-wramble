import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Bubblegum_Sans } from "next/font/google";
import "./globals.css";
import { FooterWrapper } from "@/app/ui/FooterWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const bubblegumSans = Bubblegum_Sans({
  weight: ["400"],
  variable: "--font-bubblegum-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Wordle Wramble - Spelling Fun for Kids!",
  description: "An interactive spelling game for 2nd-grade students to practice their spelling words",
  icons: {
    icon: "/favicon.ico"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${bubblegumSans.variable} antialiased bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-950 dark:to-indigo-950 min-h-screen`}
      >
        <div className="container mx-auto px-4 py-8 max-w-6xl flex flex-col min-h-screen">
          <div className="flex-grow">
            {children}
          </div>
          <FooterWrapper />
        </div>
      </body>
    </html>
  );
}
