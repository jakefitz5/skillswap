import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import ToastProvider from "@/components/providers/ToastProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SkillSwap - Learn Anything, Teach Anything",
  description:
    "Connect with passionate local teachers for affordable hobby lessons. Sports, music, arts, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-[family-name:var(--font-geist-sans)]">
        <ToastProvider>
          <Navbar />
          <main className="flex-1 pb-16 sm:pb-0">{children}</main>
          <Footer className="hidden sm:block" />
          <MobileBottomNav />
        </ToastProvider>
      </body>
    </html>
  );
}
