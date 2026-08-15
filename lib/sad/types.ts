// Système d'aide à la décision : analyse comparative des parcelles.
// Les scores sont calculés par le backend ; l'IA rédige le rapport.

export interface FacteurScore {
  type: string
  nbMesures: number
  moyenne: number
  minObserve: number
  maxObserve: number
  stabilite: number | null
  conformite: number | null
}

export interface ParcelleScore {
  rang: number
  parcelleId: number
  parcelleNom: string
  typeSol: string | null
  cultureNom: string | null
  saison: string | null
  scoreGlobal: number | null
  scoreStabilite: number | null
  scoreConformite: number | null
  nbMesures: number
  facteurs: FacteurScore[]
}

export interface AnalyseSad {
  periodeJours: number
  rapport: string
  classement: ParcelleScore[]
}
