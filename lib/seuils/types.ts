// Types des seuils d'alerte, alignés sur le backend
// (entité SeuilAlerte, SeuilAlerteRequest, SeuilAlerteResponse).
// Un seuil est configuré par le superviseur pour un couple
// TypeCulture × Saison × TypeSol.

import type { Saison } from "@/lib/cultures/types"
import type { TypeSol } from "@/lib/parcelles/types"

export interface SeuilAlerte {
  id: number
  nomCulture: string
  humiditeMin: number
  humiditeMax: number
  temperatureMin: number
  temperatureMax: number
  phMin: number
  phMax: number
  npkAzoteMin: number
  npkPhosphoreMin: number
  // Typo héritée du backend (npkPotassuimMin) — ne pas corriger côté front.
  npkPotassuimMin: number
  saison: Saison
  typeSol: TypeSol | null
  estGenereParIA: boolean
  estActif: boolean
  typeCultureId: number
  typeCultureNom: string
  typeCultureVariete: string
}

export interface SeuilAlerteRequest {
  nomCulture: string
  humiditeMin: number
  humiditeMax: number
  temperatureMin: number
  temperatureMax: number
  phMin: number
  phMax: number
  npkAzoteMin: number
  npkPhosphoreMin: number
  npkPotassuimMin: number
  saison: Saison
  typeSol: TypeSol
}
