import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "./Providers";
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-dvh bg-[var(--background)] md:bg-zinc-800`}
      >
        <div className="flex min-h-dvh md:min-h-screen md:items-center md:justify-center p-0 md:p-6">
          {/* Sur mobile: pas de mock, plein écran. Sur desktop: mock téléphone centré. */}
          <div className="relative flex w-full flex-col items-center">
            {/* Top notch (desktop uniquement) */}
            <div className="hidden md:block absolute top-0 z-10 h-6 w-32 rounded-b-2xl bg-zinc-900" />

            {/* Châssis (desktop uniquement) */}
            <div className="w-full md:w-auto md:flex md:flex-col md:rounded-[2.5rem] md:border-[10px] md:border-zinc-900 md:bg-zinc-900 md:p-2 md:shadow-2xl md:ring-2 md:ring-zinc-700">
              {/* Zone écran: scroll normal (molette/touch) */}
              <div className="no-scrollbar relative flex h-dvh w-full flex-col overflow-y-auto overflow-x-hidden bg-[var(--background)] [&>*]:min-h-0 md:h-[min(720px,80dvh)] md:w-[min(375px,calc(100vw-2rem))] md:rounded-[1.75rem]">
                <Providers>{children}</Providers>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
