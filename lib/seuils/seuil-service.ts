// Appels API des seuils d'alerte (gestion superviseur).

import { apiFetch } from "@/lib/api"
import type { SeuilAlerte, SeuilAlerteRequest } from "./types"

// Le backend attend une liste (ajout de 1..N seuils à un type de culture).
export function ajouterSeuils(
  typeCultureId: number,
  seuils: SeuilAlerteRequest[],
): Promise<SeuilAlerte[]> {
  return apiFetch<SeuilAlerte[]>(`/types-culture/${typeCultureId}/seuils`, {
    method: "POST",
    body: seuils,
  })
}

export function getSeuilsByTypeCulture(
  typeCultureId: number,
): Promise<SeuilAlerte[]> {
  return apiFetch<SeuilAlerte[]>(`/types-culture/${typeCultureId}/seuils`)
}

export function getSeuil(id: number): Promise<SeuilAlerte> {
  return apiFetch<SeuilAlerte>(`/seuils-alerte/${id}`)
}

export function modifierSeuil(
  id: number,
  data: SeuilAlerteRequest,
): Promise<SeuilAlerte> {
  return apiFetch<SeuilAlerte>(`/seuils-alerte/${id}`, {
    method: "PUT",
    body: data,
  })
}

export function supprimerSeuil(id: number): Promise<void> {
  return apiFetch<void>(`/seuils-alerte/${id}`, { method: "DELETE" })
}
