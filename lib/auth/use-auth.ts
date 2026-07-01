"use client"

// Hook d'authentification : expose l'utilisateur connecté et les actions de
// connexion / déconnexion. S'appuie sur le store externe (auth-store) lu via
// useSyncExternalStore, donc aucun Provider n'est nécessaire.

import { useSyncExternalStore } from "react"

import {
  getServerSnapshot,
  getSnapshot,
  login,
  logout,
  marquerMotDePasseChange,
  subscribe,
} from "./auth-store"
import type { AuthUser, LoginRequest } from "./types"

interface UseAuthResult {
  user: AuthUser | null
  // true tant que localStorage n'a pas été relu (évite les "flashs" d'UI au montage).
  isLoading: boolean
  isAuthenticated: boolean
  login: (credentials: LoginRequest) => Promise<AuthUser>
  logout: () => void
  // Lève le drapeau « première connexion » après un changement de mot de passe.
  marquerMotDePasseChange: () => void
}

export function useAuth(): UseAuthResult {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  return {
    user: state.user,
    isLoading: !state.hydrated,
    isAuthenticated: state.user !== null,
    login,
    logout,
    marquerMotDePasseChange,
  }
}
