// Statistiques d'une parcelle : séries de mesures par capteur (pour les graphes).

import { apiFetch } from "@/lib/api"
import type { TypeCapteur } from "@/lib/capteurs/types"

export interface MesurePoint {
  date: string // ISO
  valeur: number
}

export interface CapteurStatistique {
  capteurId: number
  capteurNom: string
  type: TypeCapteur
  unite: string
  valeurMin: number
  valeurMax: number
  points: MesurePoint[]
}

// GET /api/mesures/parcelle/{id}/statistiques?jours=30
export function getStatistiquesParcelle(
  parcelleId: number,
  jours: number,
): Promise<CapteurStatistique[]> {
  return apiFetch<CapteurStatistique[]>(
    `/mesures/parcelle/${parcelleId}/statistiques?jours=${jours}`,
  )
}
