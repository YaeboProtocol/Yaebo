import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { cn } from "@/lib/utils";
import { ClientInit } from "@/components/ClientInit";

export const metadata: Metadata = {
  title: "STD Protocol Interface",
  description: "Interface for the STD Protocol platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen flex flex-col bg-background text-foreground", /* Add any body specific classes here */)}>
        <ClientInit />
        <Header />
        <main className="flex-grow container mx-auto p-4">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
