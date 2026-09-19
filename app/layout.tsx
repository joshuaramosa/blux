import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Playfair_Display, Satisfy } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { PwaRegister } from "@/components/pwa-register";

const sansFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const displayFont = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["600", "700", "800", "900"],
});

const scriptFont = Satisfy({
  subsets: ["latin"],
  variable: "--font-script",
  display: "swap",
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "EL BLUX — Restaurante & Delivery",
  description: "Restaurante & Delivery Sabor de Casa. Caldo de gallina, mostritos, broaster y postres caseros.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BLUX",
  },
  icons: {
    icon: "/logo.png",
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#E4572E",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={cn(
        "h-full antialiased",
        sansFont.variable,
        displayFont.variable,
        scriptFont.variable
      )}
    >
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <Toaster />
        <PwaRegister />
      </body>
    </html>
  );
}
