import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import React from "react";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { AuthProvider } from "@/providers/Auth";

const inter = Inter({
  subsets: ["latin"],
  preload: true,
  display: "swap",
});

export const metadata: Metadata = {
  title: "Thaki Agent",
  description: "Thaki Agent Chat by Rewaa",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`flex flex-col justify-center ${inter.className}`}>
        <NuqsAdapter>
          <AuthProvider>
            {children}
          </AuthProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
