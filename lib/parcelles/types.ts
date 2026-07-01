// Types et énumérations liés aux parcelles, alignés sur le backend Spring Boot
// (entité Parcelle, ParcelleRequest, ParcelleResponse).

// Type de sol — voir TypeSolEnum côté backend.
export type TypeSol =
  | "ARGILEUX"
  | "SABLONNEUX"
  | "LIMONEUX"
  | "HUMIFERE"
  | "LATERITIQUE"

// Environnement de culture — voir EnvironnementEnum côté backend.
export type Environnement = "PLEIN_AIR" | "CONTROLE"

// Corps envoyé à POST/PUT /api/parcelles.
export interface ParcelleRequest {
  nom: string
  description?: string
  superficie: number
  latitude: number
  longitude: number
  typeSol: TypeSol
  environnement: Environnement
}

// Réponse renvoyée par l'API pour une parcelle.
export interface Parcelle {
  id: number
  nom: string
  description?: string
  superficie: number
  latitude: number
  longitude: number
  typeSol: TypeSol
  environnement: Environnement
  actif: boolean
  dateCreation: string
}

// Libellés lisibles (français) pour l'affichage.
export const TYPE_SOL_LABELS: Record<TypeSol, string> = {
  ARGILEUX: "Argileux",
  SABLONNEUX: "Sablonneux",
  LIMONEUX: "Limoneux",
  HUMIFERE: "Humifère",
  LATERITIQUE: "Latéritique",
}

export const ENVIRONNEMENT_LABELS: Record<Environnement, string> = {
  PLEIN_AIR: "Plein air",
  CONTROLE: "Contrôlé",
}

// Descriptions des environnements (utile dans les formulaires/infobulles).
export const ENVIRONNEMENT_DESCRIPTIONS: Record<Environnement, string> = {
  PLEIN_AIR: "Culture en extérieur, exposée aux conditions naturelles.",
  CONTROLE: "Environnement maîtrisé : serre, dôme, etc.",
}

// Options dérivées pour les listes déroulantes.
export const TYPE_SOL_OPTIONS = (
  Object.keys(TYPE_SOL_LABELS) as TypeSol[]
).map((value) => ({ value, label: TYPE_SOL_LABELS[value] }))

export const ENVIRONNEMENT_OPTIONS = (
  Object.keys(ENVIRONNEMENT_LABELS) as Environnement[]
).map((value) => ({
  value,
  label: ENVIRONNEMENT_LABELS[value],
  description: ENVIRONNEMENT_DESCRIPTIONS[value],
}))
