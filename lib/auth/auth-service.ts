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

