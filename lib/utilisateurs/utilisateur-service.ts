// Service d'accès à l'API des utilisateurs.

import { apiFetch } from "@/lib/api"
import type { Utilisateur, UtilisateurRequest } from "./types"

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
