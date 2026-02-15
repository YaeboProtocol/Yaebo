import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { cn } from "@/lib/utils";
import { ClientInit } from "@/components/ClientInit";
import { Toaster } from "@/components/ui/toaster";
import { LayoutWrapper } from "./layout-wrapper";

export const metadata: Metadata = {
  title: "TachyonX Interface",
  description: "Interface for the TachyonX platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen flex flex-col bg-background text-foreground" /* Add any body specific classes here */
        )}
      >
        <Script
          id="suppress-extension-errors"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              // Suppress browser extension errors (e.g., Stacks wallet)
              (function() {
                const originalDefineProperty = Object.defineProperty;
                Object.defineProperty = function(obj, prop, descriptor) {
                  try {
                    return originalDefineProperty.call(this, obj, prop, descriptor);
                  } catch (e) {
                    // Suppress "Cannot redefine property" errors from browser extensions
                    if (e.message && e.message.includes('Cannot redefine property')) {
                      return obj;
                    }
                    throw e;
                  }
                };
              })();
            `,
          }}
        />
        <ClientInit />
        <Header />
        <LayoutWrapper>{children}</LayoutWrapper>
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
