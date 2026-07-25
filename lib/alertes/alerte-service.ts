// Service d'accès à l'API des alertes.

import { apiFetch } from "@/lib/api"
import type { Alerte } from "./types"

// GET /api/alertes — toutes les alertes des parcelles accessibles.
export function getMesAlertes(): Promise<Alerte[]> {
  return apiFetch<Alerte[]>("/alertes")
}

// GET /api/alertes/parcelle/{id}
export function getAlertesByParcelle(parcelleId: number): Promise<Alerte[]> {
  return apiFetch<Alerte[]>(`/alertes/parcelle/${parcelleId}`)
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
