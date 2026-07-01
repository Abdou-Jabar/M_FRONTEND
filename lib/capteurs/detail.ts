// Détail complet d'un capteur (capteur + dispositif + parcelle + série),
// servi par GET /api/mesures/capteur/{id}/detail (accessible ADMIN/AGRICULTEUR
// avec contrôle d'accès tenant).

import { apiFetch } from "@/lib/api"
import type { TypeCapteur } from "./types"
import type { StatutDispositif } from "@/lib/dispositifs/types"
import type { Environnement } from "@/lib/parcelles/types"
import type { MesurePoint } from "@/lib/parcelles/statistiques"

export interface CapteurDetail {
  // Capteur
  capteurId: number
  capteurNom: string
  type: TypeCapteur
  modele?: string
  unite: string
  valeurMin: number
  valeurMax: number
  actif: boolean

  // Dispositif
  dispositifId: number
  dispositifNom: string
  dispositifAdresseMac: string
  dispositifStatut: StatutDispositif
  dispositifBatteriePct: number

  // Parcelle
  parcelleId: number
  parcelleNom: string
  parcelleEnvironnement: Environnement

  // Série de mesures
  points: MesurePoint[]
}

export function getCapteurDetail(
  capteurId: number,
  jours: number,
): Promise<CapteurDetail> {
  return apiFetch<CapteurDetail>(
    `/mesures/capteur/${capteurId}/detail?jours=${jours}`,
  )
}
