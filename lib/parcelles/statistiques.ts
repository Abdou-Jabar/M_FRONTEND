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

// Série d'une parcelle pour un type de capteur (comparaison multi-parcelles).
export interface SerieComparaison {
  parcelleId: number
  parcelleNom: string
  type: TypeCapteur
  unite: string
  points: MesurePoint[]
}

// GET /api/mesures/comparer?parcelleIds=1&parcelleIds=2&type=HUMIDITE_SOL&jours=30
export function comparerParcelles(
  parcelleIds: number[],
  type: TypeCapteur,
  jours: number,
): Promise<SerieComparaison[]> {
  // Spring @RequestParam List<Long> attend parcelleIds=1&parcelleIds=2
  const params = parcelleIds.map((id) => `parcelleIds=${id}`).join("&")
  return apiFetch<SerieComparaison[]>(
    `/mesures/comparer?${params}&type=${type}&jours=${jours}`,
  )
}
