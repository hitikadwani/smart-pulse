import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Inter } from "next/font/google"
import { cn } from "@/lib/utils";
import Navbar from "@/components/Navbar";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"]});

export const metadata: Metadata = {
  title: "Smart-Pulse",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn(inter.className, "antialiased min-h-screen pt-16")}>
        <Navbar />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
