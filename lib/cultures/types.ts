// Types liés aux cultures, alignés sur le backend.

export type StatutCulture = "PLANIFIEE" | "EN_COURS" | "RECOLTEE" | "ABANDONNEE"
export type Saison = "SAISON_SECHE" | "SAISON_PLUVIEUSE"

export const STATUT_CULTURE_LABELS: Record<StatutCulture, string> = {
  PLANIFIEE:  "Planifiée",
  EN_COURS:   "En cours",
  RECOLTEE:   "Récoltée",
  ABANDONNEE: "Abandonnée",
}

export const SAISON_LABELS: Record<Saison, string> = {
  SAISON_SECHE:      "Saison sèche",
  SAISON_PLUVIEUSE:  "Saison pluvieuse",
}

export interface Culture {
  id: number
  dateDebut: string
  dateFin: string | null
  statut: StatutCulture
  saison: Saison
  parcelleId: number
  parcelleNom: string
  typeCultureId: number
  typeCultureNom: string
  typeCultureVariete: string
  seuilAlerteId: number | null
  seuilAlerteNom: string | null
}
