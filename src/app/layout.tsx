import type { Metadata, Viewport } from "next";
import { Inter, Oswald, Antonio } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const oswald = Oswald({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-oswald",
});

const antonio = Antonio({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-antonio",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#f97316",
};

export const metadata: Metadata = {
  title: "ResiliAi - Disaster Preparedness",
  description: "AI-powered survival intelligence. Audit your home. Train for emergencies. Stay prepared.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ResiliAi",
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

import { ThemeProvider } from "@/components/providers/ThemeProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // HTML class handling is now done by ThemeProvider, so we can remove hardcoded 'dark' or keep strictly as default fallback
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className={`${inter.variable} ${oswald.variable} ${antonio.variable} font-sans antialiased bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-gray-50 transition-colors duration-300`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
