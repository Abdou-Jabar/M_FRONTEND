// Service d'accès à l'API des utilisateurs.

import { apiFetch } from "@/lib/api"
import type {
  ProfilUpdateRequest,
  Utilisateur,
  UtilisateurRequest,
} from "./types"

// ── Profil de l'utilisateur connecté ──────────────────────────

// GET /api/utilisateurs/me — profil de l'utilisateur connecté.
export function getMonProfil(): Promise<Utilisateur> {
  return apiFetch<Utilisateur>("/utilisateurs/me")
}

// PUT /api/utilisateurs/me — met à jour nom/prénom (email non modifiable).
export function mettreAJourMonProfil(
  data: ProfilUpdateRequest,
): Promise<Utilisateur> {
  return apiFetch<Utilisateur>("/utilisateurs/me", {
    method: "PUT",
    body: data,
  })
}

// POST /api/utilisateurs/me/photo — upload de la photo de profil (multipart).
export function uploadMaPhoto(fichier: File): Promise<Utilisateur> {
  const formData = new FormData()
  formData.append("photo", fichier)
  return apiFetch<Utilisateur>("/utilisateurs/me/photo", {
    method: "POST",
    body: formData,
  })
}

// Crée un utilisateur (dans l'organisation de l'ADMIN courant côté backend).
export function creerUtilisateur(
  data: UtilisateurRequest,
): Promise<Utilisateur> {
  return apiFetch<Utilisateur>("/utilisateurs", {
    method: "POST",
    body: data,
  })
}

export function getUtilisateurs(): Promise<Utilisateur[]> {
  return apiFetch<Utilisateur[]>("/utilisateurs")
}

export function getUtilisateur(id: number): Promise<Utilisateur> {
  return apiFetch<Utilisateur>(`/utilisateurs/${id}`)
}

export function modifierUtilisateur(
  id: number,
  data: UtilisateurRequest,
): Promise<Utilisateur> {
  return apiFetch<Utilisateur>(`/utilisateurs/${id}`, {
    method: "PUT",
    body: data,
  })
}

export function supprimerUtilisateur(id: number): Promise<void> {
  return apiFetch<void>(`/utilisateurs/${id}`, { method: "DELETE" })
}
