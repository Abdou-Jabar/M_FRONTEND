import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeCookieSync } from "@/components/theme-cookie-sync"

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AgriSmart",
  description: "L'agriculture intelligente, à portée de main",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Thème partagé entre sous-domaines via un cookie posé sur le domaine racine.
  // On le lit côté serveur pour fixer le thème initial sans clignotement (FOUC).
  const cookieStore = await cookies();
  const initialTheme = cookieStore.get("theme")?.value ?? "system";

  return (
    <html
      lang="fr"
      className={cn("h-full", "scroll-smooth", "antialiased", geistSans.variable, geistMono.variable, "font-sans", inter.variable)} suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning><ThemeProvider
          attribute="class"
          defaultTheme={initialTheme}
          enableSystem
          disableTransitionOnChange
        ><ThemeCookieSync /><TooltipProvider>
          {children}
          <Toaster richColors position="top-center" />
        </TooltipProvider></ThemeProvider></body>
    </html>
  );
}
