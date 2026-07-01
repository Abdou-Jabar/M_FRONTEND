"use client"

// Fournisseur de thème (clair / sombre / système) basé sur next-themes.
// On pilote le thème via la classe CSS `.dark` (voir globals.css et le
// @custom-variant dark défini par shadcn).

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
