import type { Metadata, Viewport } from "next";
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
  title: "SCHOLA – Your path to WASSCE success",
  description:
    "Empowering SHS students in Ghana to achieve academic excellence through personalized learning.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#1e3a5f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-slate-900`}
      >
        <div className="flex min-h-screen items-center justify-center">
          {/* Mobile frame to match Figma (approx. 395x885) */}
          <div className="relative flex h-[885px] w-full max-w-[395px] flex-col overflow-hidden rounded-3xl bg-[var(--background)] shadow-2xl">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
