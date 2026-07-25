// Service et types pour le tableau de bord d'une parcelle (vue agriculteur).

import { apiFetch } from "@/lib/api"
import type { AlerteResume } from "@/lib/alertes/types"
import type { Environnement, TypeSol } from "./types"

export interface CultureActive {
  id: number
  typeCultureNom: string
  typeCultureVariete: string
  statut: string
  saison: string
  dateDebut: string
}

export interface TableauDeBordParcelle {
  parcelleId: number
  parcelleNom: string
  parcelleDescription: string | null
  superficie: number
  typeSol: TypeSol
  environnement: Environnement
  latitude: number | null
  longitude: number | null
  culture: CultureActive | null
  alertes: AlerteResume[]
  totalAlertesNonResolues: number
}

// GET /api/parcelles/{id}/tableau-de-bord
export function getTableauDeBordParcelle(
  id: number,
): Promise<TableauDeBordParcelle> {
  return apiFetch<TableauDeBordParcelle>(`/parcelles/${id}/tableau-de-bord`)
}
