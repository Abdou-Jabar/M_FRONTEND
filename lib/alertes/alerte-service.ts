// Service d'accès à l'API des alertes (pagination côté serveur).

import { apiFetch } from "@/lib/api"
import type { Page } from "@/lib/tickets/types"
import type { Alerte, NiveauAlerte } from "./types"

// Filtre optionnel des listes (FiltreAlerteEnum côté backend).
export type FiltreAlerte = "NON_LUES" | "NON_RESOLUES"

// GET /api/alertes — alertes paginées des parcelles accessibles.
export function getMesAlertes(
  options: {
    filtre?: FiltreAlerte
    niveau?: NiveauAlerte
    page?: number
    size?: number
  } = {},
): Promise<Page<Alerte>> {
  const params = new URLSearchParams()
  params.set("page", String(options.page ?? 0))
  params.set("size", String(options.size ?? 10))
  if (options.filtre) params.set("filtre", options.filtre)
  if (options.niveau) params.set("niveau", options.niveau)
  return apiFetch<Page<Alerte>>(`/alertes?${params.toString()}`)
}

// GET /api/alertes/parcelle/{id} — paginé.
export function getAlertesByParcelle(
  parcelleId: number,
  page = 0,
  size = 10,
): Promise<Page<Alerte>> {
  return apiFetch<Page<Alerte>>(
    `/alertes/parcelle/${parcelleId}?page=${page}&size=${size}`,
  )
}

// GET /api/alertes/nb-non-resolues — compteur pour les badges.
export function getNbAlertesNonResolues(): Promise<number> {
  return apiFetch<number>("/alertes/nb-non-resolues")
}

// PATCH /api/alertes/{id}/lire — marquer comme lue.
export function marquerAlerteLue(id: number): Promise<Alerte> {
  return apiFetch<Alerte>(`/alertes/${id}/lire`, { method: "PATCH" })
}

// PATCH /api/alertes/{id}/resoudre — marquer comme résolue.
export function resoudreAlerte(id: number): Promise<Alerte> {
  return apiFetch<Alerte>(`/alertes/${id}/resoudre`, { method: "PATCH" })
}

// Supprime le préfixe technique "[TYPE_CAPTEUR] " du message d'alerte.
export function messageListible(message: string): string {
  if (message.startsWith("[") && message.includes("] ")) {
    return message.substring(message.indexOf("] ") + 2)
  }
  return message
}
