// Store d'authentification externe (hors React), branché sur localStorage.
//
// On l'expose à React via useSyncExternalStore (voir use-auth.ts) : c'est l'outil
// idiomatique pour lire une source externe comme localStorage sans déclencher de
// setState synchrone dans un effet, et sans incohérence d'hydratation SSR.

import { login as loginRequest } from "./auth-service"
import {
  clearAuth,
  getStoredUser,
  getToken,
  setStoredUser,
  setToken,
} from "./storage"
import type { AuthUser, LoginRequest } from "./types"

export interface AuthState {
  user: AuthUser | null
  // false tant que le store n'a pas lu localStorage (rendu serveur / 1er rendu client).
  hydrated: boolean
}

// État renvoyé côté serveur : toujours stable et "non hydraté".
const SERVER_STATE: AuthState = { user: null, hydrated: false }

let state: AuthState = SERVER_STATE
let initialized = false
const listeners = new Set<() => void>()

function emit() {
  for (const listener of listeners) listener()
}

// Lecture paresseuse de localStorage, effectuée une seule fois côté client.
function ensureInitialized() {
  if (initialized) return
  initialized = true
  const token = getToken()
  const user = getStoredUser()
  state = { user: token && user ? user : null, hydrated: true }
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

// getSnapshot doit renvoyer une référence stable tant que l'état ne change pas.
export function getSnapshot(): AuthState {
  ensureInitialized()
  return state
}

export function getServerSnapshot(): AuthState {
  return SERVER_STATE
}

// Connexion : appelle l'API, persiste le token + l'utilisateur, met à jour le store.
export async function login(credentials: LoginRequest): Promise<AuthUser> {
  const response = await loginRequest(credentials)
  const { token, ...user } = response

  setToken(token)
  setStoredUser(user)

  initialized = true
  state = { user, hydrated: true }
  emit()

  return user
}

// Déconnexion : purge localStorage et le store.
export function logout(): void {
  clearAuth()
  initialized = true
  state = { user: null, hydrated: true }
  emit()
}

// Marque le mot de passe comme changé : lève le drapeau « première connexion »
// sur l'utilisateur courant, persiste et notifie React. Appelé après un
// changement de mot de passe réussi.
export function marquerMotDePasseChange(): void {
  if (!state.user) return
  const user: AuthUser = { ...state.user, premiereConnexion: false }
  setStoredUser(user)
  initialized = true
  state = { user, hydrated: true }
  emit()
}

// Met à jour partiellement l'utilisateur courant (ex. après édition du profil
// ou changement de photo), persiste et notifie React.
export function mettreAJourUtilisateur(partiel: Partial<AuthUser>): void {
  if (!state.user) return
  const user: AuthUser = { ...state.user, ...partiel }
  setStoredUser(user)
  initialized = true
  state = { user, hydrated: true }
  emit()
}
