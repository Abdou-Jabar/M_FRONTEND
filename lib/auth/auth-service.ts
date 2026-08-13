// Service d'authentification : appels à l'API d'auth du backend.

import { apiFetch } from "../api"
import type {
  AuthResponse,
  ChangerMotDePasseRequest,
  LoginRequest,
} from "./types"

// POST /api/auth/login — connexion par email + mot de passe.
// Route publique : on ne joint pas de token (auth: false).
export function login(credentials: LoginRequest): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: credentials,
    auth: false,
  })
}

// POST /api/auth/changer-mot-de-passe — changement du mot de passe de
// l'utilisateur connecté (notamment le changement forcé à la première connexion).
export function changerMotDePasse(
  payload: ChangerMotDePasseRequest,
): Promise<void> {
  return apiFetch<void>("/auth/changer-mot-de-passe", {
    method: "POST",
    body: payload,
  })
}

// POST /api/auth/mot-de-passe-oublie/demander-code — étape 1 (public).
// Répond toujours 204, que l'email existe ou non (anti-énumération).
export function demanderCodeReinitialisation(email: string): Promise<void> {
  return apiFetch<void>("/auth/mot-de-passe-oublie/demander-code", {
    method: "POST",
    body: { email },
    auth: false,
  })
}

// POST /api/auth/mot-de-passe-oublie/reinitialiser — étape 2 (public).
export function reinitialiserMotDePasse(payload: {
  email: string
  code: string
  nouveauMotDePasse: string
}): Promise<void> {
  return apiFetch<void>("/auth/mot-de-passe-oublie/reinitialiser", {
    method: "POST",
    body: payload,
    auth: false,
  })
}

