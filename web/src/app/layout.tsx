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
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-zinc-800`}
      >
        <div className="flex min-h-screen items-center justify-center p-6">
          {/* Phone mock: bezel + screen (realistic mobile device in browser) */}
          <div className="relative flex flex-col items-center">
            {/* Top notch / dynamic island style */}
            <div className="absolute top-0 z-10 h-6 w-32 rounded-b-2xl bg-zinc-900" />
            {/* Phone bezel (chassis) - taille type téléphone (375x720), pas tablette */}
            <div className="flex flex-col rounded-[2.5rem] border-[10px] border-zinc-900 bg-zinc-900 p-2 shadow-2xl ring-2 ring-zinc-700">
              {/* Zone écran : pas de scroll, tout doit tenir dans la hauteur */}
              <div className="relative flex h-[min(720px,80dvh)] w-[min(375px,calc(100vw-2rem))] flex-col overflow-hidden rounded-[1.75rem] bg-[var(--background)] [&>*]:min-h-0">
                {children}
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
