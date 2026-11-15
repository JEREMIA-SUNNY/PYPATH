import type { Metadata } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { CommandPalette } from "@/components/command-palette";
import { Navbar } from "@/components/navbar";
import { HostedBanners } from "@/components/hosted/banners";
import { ProgressGate } from "@/components/hosted/progress-gate";
import { AppProvider } from "@/components/providers";
import { themeScript } from "@/components/theme-toggle";
import { getCatalog } from "@/lib/content";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "PyPath", template: "%s · PyPath" },
  description: "Learn Python from zero to advanced, on your own machine.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const catalog = getCatalog();
  return (
    <html lang="en" suppressHydrationWarning className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen">
        <ProgressGate>
          <AppProvider catalog={catalog}>
            <CommandPalette />
            <Navbar />
            <HostedBanners />
            {children}
          </AppProvider>
        </ProgressGate>
      </body>
    </html>
  );
}
