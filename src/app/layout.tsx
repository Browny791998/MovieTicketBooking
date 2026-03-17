import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { ToastProvider, ToastViewport } from "@/components/ui/toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dat Shin — Book Movie Tickets",
  description: "Experience cinema like never before. Book your seats at Dat Shin.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} antialiased bg-zinc-950 text-zinc-100 min-h-screen`}>
        <SessionProvider>
          <ToastProvider>
            {children}
            <ToastViewport />
          </ToastProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
