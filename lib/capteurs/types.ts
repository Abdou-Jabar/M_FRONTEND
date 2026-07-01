// Types et énumérations liés aux capteurs, alignés sur le backend Spring Boot
// (entité Capteur, CapteurRequest, CapteurResponse).

// Type de capteur — voir TypeCapteurEnum côté backend.
export type TypeCapteur =
  | "TEMPERATURE_AIR"
  | "HUMIDITE_AIR"
  | "LUMINOSITE"
  | "TEMPERATURE_SOL"
  | "HUMIDITE_SOL"
  | "PH_SOL"
  | "NPK_AZOTE"
  | "NPK_PHOSPHORE"
  | "NPK_POTASSIUM"
  | "PLUIE"

// Corps envoyé à POST/PUT /api/capteurs.
export interface CapteurRequest {
  nom: string
  type: TypeCapteur
  modele?: string
  unite: string
  valeurMin: number
  valeurMax: number
  dispositifId: number
}

// Réponse renvoyée par l'API pour un capteur.
export interface Capteur {
  id: number
  nom: string
  type: TypeCapteur
  modele?: string
  unite: string
  valeurMin: number
  valeurMax: number
  actif: boolean
  dispositifId: number
  dispositifNom: string
  parcelleId: number
  parcelleNom: string
}

// Libellés lisibles (français) pour l'affichage du type de capteur.
export const TYPE_CAPTEUR_LABELS: Record<TypeCapteur, string> = {
  TEMPERATURE_AIR: "Température de l'air",
  HUMIDITE_AIR: "Humidité de l'air",
  LUMINOSITE: "Luminosité",
  TEMPERATURE_SOL: "Température du sol",
  HUMIDITE_SOL: "Humidité du sol",
  PH_SOL: "pH du sol",
  NPK_AZOTE: "Azote (N)",
  NPK_PHOSPHORE: "Phosphore (P)",
  NPK_POTASSIUM: "Potassium (K)",
  PLUIE: "Pluie",
}

// Unité par défaut suggérée selon le type (pré-remplissage du formulaire).
export const UNITE_PAR_DEFAUT: Record<TypeCapteur, string> = {
  TEMPERATURE_AIR: "°C",
  HUMIDITE_AIR: "%",
  LUMINOSITE: "lux",
  TEMPERATURE_SOL: "°C",
  HUMIDITE_SOL: "%",
  PH_SOL: "pH",
  NPK_AZOTE: "mg/kg",
  NPK_PHOSPHORE: "mg/kg",
  NPK_POTASSIUM: "mg/kg",
  PLUIE: "mm",
}

// Options dérivées pour les listes déroulantes.
export const TYPE_CAPTEUR_OPTIONS = (
  Object.keys(TYPE_CAPTEUR_LABELS) as TypeCapteur[]
).map((value) => ({ value, label: TYPE_CAPTEUR_LABELS[value] }))
