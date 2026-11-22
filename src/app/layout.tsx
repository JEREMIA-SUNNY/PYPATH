import type { Metadata, Viewport } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { CommandPalette } from "@/components/command-palette";
import { Navbar } from "@/components/navbar";
import { HostedBanners } from "@/components/hosted/banners";
import { ProgressGate } from "@/components/hosted/progress-gate";
import { ProfileGate } from "@/components/profile-picker";
import { AppProvider } from "@/components/providers";
import { themeScript } from "@/components/theme-toggle";
import { getCatalog } from "@/lib/content";
import "./globals.css";

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

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
            <ProfileGate>
              <CommandPalette />
              <Navbar />
              <HostedBanners />
              {children}
            </ProfileGate>
          </AppProvider>
        </ProgressGate>
      </body>
    </html>
  );
}
