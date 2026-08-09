// Service d'accès à l'API des cultures.

import { apiFetch } from "@/lib/api"
import type { Culture, CultureRequest } from "./types"

// Démarre une nouvelle culture sur une parcelle (statut EN_COURS).
export function creerCulture(data: CultureRequest): Promise<Culture> {
  return apiFetch<Culture>("/cultures", { method: "POST", body: data })
}

// GET /api/cultures — toutes les cultures de l'utilisateur (isolation tenant).
export function getMesCultures(): Promise<Culture[]> {
  return apiFetch<Culture[]>("/cultures")
}

// GET /api/cultures/{id}
export function getCulture(id: number): Promise<Culture> {
  return apiFetch<Culture>(`/cultures/${id}`)
}

// GET /api/cultures/parcelle/{id}
export function getCulturesByParcelle(parcelleId: number): Promise<Culture[]> {
  return apiFetch<Culture[]>(`/cultures/parcelle/${parcelleId}`)
}

// PUT /api/cultures/{id}/recolter — marquer comme récoltée.
export function recolterCulture(id: number): Promise<Culture> {
  return apiFetch<Culture>(`/cultures/${id}/recolter`, { method: "PUT" })
}

// DELETE /api/cultures/{id} — abandon (suppression logique → ABANDONNEE).
export function abandonnerCulture(id: number): Promise<void> {
  return apiFetch<void>(`/cultures/${id}`, { method: "DELETE" })
}
