// Types liés aux alertes, alignés sur le backend.

export type NiveauAlerte = "INFO" | "ATTENTION" | "CRITIQUE" | "URGENCE"

export const NIVEAU_LABELS: Record<NiveauAlerte, string> = {
  INFO:      "Information",
  ATTENTION: "Attention",
  CRITIQUE:  "Critique",
  URGENCE:   "Urgence",
}

// Variante de couleur shadcn/ui badge par niveau.
export const NIVEAU_BADGE: Record<
  NiveauAlerte,
  "default" | "secondary" | "destructive" | "outline"
> = {
  INFO:      "secondary",
  ATTENTION: "outline",
  CRITIQUE:  "destructive",
  URGENCE:   "destructive",
}

// Couleur texte Tailwind pour l'icône d'alerte.
export const NIVEAU_COULEUR: Record<NiveauAlerte, string> = {
  INFO:      "text-blue-500",
  ATTENTION: "text-amber-500",
  CRITIQUE:  "text-orange-600",
  URGENCE:   "text-red-600",
}

export interface Alerte {
  id: number
  message: string
  niveau: NiveauAlerte
  typeCapteur: string
  lue: boolean
  resolue: boolean
  date: string
  parcelleId: number
  parcelleNom: string
  mesureId: number | null
  valeurMesuree: number | null
}

// Version résumée (utilisée dans le tableau de bord parcelle).
export interface AlerteResume {
  id: number
  messageListible: string
  niveau: NiveauAlerte
  facteur: string
  valeurMesuree: number | null
  date: string
  lue: boolean
}
