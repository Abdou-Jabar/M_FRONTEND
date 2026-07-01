// Affectation technicien ↔ organisation (mission), alignée sur le backend.

// Cycle de vie d'une mission, piloté par le technicien.
export type StatutMission = "A_DEMARRER" | "EN_COURS" | "TERMINEE"

export interface Affectation {
  id: number
  technicienId: number
  technicienNomComplet: string
  technicienEmail: string
  organisationId: number
  organisationNom: string
  statut: StatutMission
  dateAffectation: string
  dateDebut: string | null
  dateFin: string | null
  active: boolean
}

export interface AffectationRequest {
  technicienId: number
  organisationId: number
}

// Libellés d'affichage des statuts.
export const LIBELLE_STATUT: Record<StatutMission, string> = {
  A_DEMARRER: "À démarrer",
  EN_COURS: "En cours",
  TERMINEE: "Terminée",
}

// Ordre des colonnes du kanban.
export const STATUTS_ORDONNES: StatutMission[] = [
  "A_DEMARRER",
  "EN_COURS",
  "TERMINEE",
]
