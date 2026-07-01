"use client"

// Synchronise le thème (clair / sombre / système) entre TOUS les sous-domaines
// (racine, app., admin., ...).
//
// next-themes mémorise le thème dans le localStorage, qui est isolé par origine.
// Or l'application est servie sur plusieurs sous-domaines (localhost,
// app.localhost, admin.localhost) : chaque origine a donc son propre
// localStorage et le thème n'était pas partagé d'une page à l'autre.
//
// On écrit en plus le thème dans un cookie posé sur le domaine racine
// (ex. « localhost » ou « agrismart.com »), visible par tous les sous-domaines.
// Le layout serveur lit ce cookie pour fixer le thème initial (voir layout.tsx),
// et ce composant le maintient à jour côté client.

import { useEffect } from "react"
import { useTheme } from "next-themes"

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "localhost"
const COOKIE_NAME = "theme"
const ONE_YEAR = 60 * 60 * 24 * 365

function readCookie(name: string): string | undefined {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
    ?.split("=")[1]
}

function writeCookie(name: string, value: string) {
  document.cookie =
    `${name}=${value}; domain=${ROOT_DOMAIN}; path=/; ` +
    `max-age=${ONE_YEAR}; SameSite=Lax`
}

export function ThemeCookieSync() {
  const { theme, setTheme } = useTheme()

  // Au montage : si un autre sous-domaine a déjà choisi un thème (cookie),
  // on l'applique pour rester cohérent.
  useEffect(() => {
    const fromCookie = readCookie(COOKIE_NAME)
    if (fromCookie && fromCookie !== theme) {
      setTheme(fromCookie)
    }
    // On ne veut exécuter cette réconciliation qu'une seule fois, au montage.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // À chaque changement de thème : on met à jour le cookie partagé.
  useEffect(() => {
    if (theme) {
      writeCookie(COOKIE_NAME, theme)
    }
  }, [theme])

  return null
}
