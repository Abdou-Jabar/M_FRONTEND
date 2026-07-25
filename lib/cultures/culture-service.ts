// Service d'accès à l'API des cultures.

import { apiFetch } from "@/lib/api"
import type { Culture } from "./types"

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
