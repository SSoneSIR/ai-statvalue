import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "../components/theme-provider";
import { Navigation } from "../components/navigation";
import { Footer } from "../components/footer";
import { Providers } from "./context/provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "StatValue AI - Football Player Statistics & Predictions",
  description:
    "Compare football players, predict market values, and discover similar players using AI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="flex min-h-screen flex-col bg-white">
              <Navigation />
              <main className="flex-1 bg-white">{children}</main>
              <Footer />
            </div>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
