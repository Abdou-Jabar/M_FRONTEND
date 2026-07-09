// Persistance du token JWT et de l'utilisateur connecté côté navigateur.
//
// On utilise localStorage : il est propre à chaque origine, donc le token de
// l'espace utilisateurs (app.localhost) et celui de l'admin (admin.localhost)
// restent cloisonnés, ce qui est exactement le comportement souhaité.

import type { AuthUser } from "./types"

const TOKEN_KEY = "agrismart.token"
const USER_KEY = "agrismart.user"

// Indique si on s'exécute côté navigateur (les composants serveur n'ont pas de window).
const isBrowser = () => typeof window !== "undefined"

// Décode le claim `exp` (date d'expiration, en secondes) de la charge utile d'un
// JWT. Renvoie null si le token est malformé ou n'a pas de claim `exp` lisible.
function lireExpiration(token: string): number | null {
  const parties = token.split(".")
  if (parties.length !== 3) return null
  try {
    // Payload JWT = base64url ; on le convertit en base64 standard avant atob.
    const base64 = parties[1].replace(/-/g, "+").replace(/_/g, "/")
    const payload = JSON.parse(atob(base64)) as { exp?: number }
    return typeof payload.exp === "number" ? payload.exp : null
  } catch {
    return null
  }
}

// Vrai si le token possède un claim `exp` et que celui-ci est dépassé.
// Si l'expiration n'est pas lisible, on ne bloque pas (le backend renverra 401
// le cas échéant) afin d'éviter une déconnexion injustifiée.
export function isTokenExpired(token: string): boolean {
  const exp = lireExpiration(token)
  if (exp === null) return false
  // `exp` est exprimé en secondes (standard JWT) ; Date.now() en millisecondes.
  return Date.now() >= exp * 1000
}

export function getToken(): string | null {
  if (!isBrowser()) return null
  const token = window.localStorage.getItem(TOKEN_KEY)
  if (!token) return null
  // Token expiré : on purge et on se considère déconnecté immédiatement,
  // sans attendre un appel API qui renverrait 401.
  if (isTokenExpired(token)) {
    clearAuth()
    return null
  }
  return token
}

// Durée restante (en millisecondes) avant l'expiration du token courant.
// - null si aucun token, ou si l'expiration n'est pas lisible (pas de claim exp).
// - valeur négative ou nulle si le token est déjà expiré.
// Sert à programmer une déconnexion proactive à l'instant exact d'expiration.
export function dureeAvantExpiration(): number | null {
  if (!isBrowser()) return null
  const token = window.localStorage.getItem(TOKEN_KEY)
  if (!token) return null
  const exp = lireExpiration(token)
  if (exp === null) return null
  return exp * 1000 - Date.now()
}

export function setToken(token: string): void {
  if (!isBrowser()) return
  window.localStorage.setItem(TOKEN_KEY, token)
}

export function getStoredUser(): AuthUser | null {
  if (!isBrowser()) return null
  const raw = window.localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

export function setStoredUser(user: AuthUser): void {
  if (!isBrowser()) return
  window.localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearAuth(): void {
  if (!isBrowser()) return
  window.localStorage.removeItem(TOKEN_KEY)
  window.localStorage.removeItem(USER_KEY)
}
