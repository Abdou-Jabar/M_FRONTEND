// Types des seuils d'alerte, alignés sur le backend
// (entité SeuilAlerte, SeuilAlerteRequest, SeuilAlerteResponse).
// Un seuil est configuré par le superviseur pour un couple
// TypeCulture × Saison × TypeSol. Chaque type de capteur possède ses
// bornes min/max propres ; null = facteur non contrôlé (seuil historique).

import type { Saison } from "@/lib/cultures/types"
import type { TypeSol } from "@/lib/parcelles/types"

// Bornes min/max des 9 facteurs mesurés (hors pluie).
export interface BornesSeuil {
  temperatureAirMin: number | null
  temperatureAirMax: number | null
  humiditeAirMin: number | null
  humiditeAirMax: number | null
  luminositeMin: number | null
  luminositeMax: number | null
  temperatureSolMin: number | null
  temperatureSolMax: number | null
  humiditeSolMin: number | null
  humiditeSolMax: number | null
  phMin: number | null
  phMax: number | null
  npkAzoteMin: number | null
  npkAzoteMax: number | null
  npkPhosphoreMin: number | null
  npkPhosphoreMax: number | null
  npkPotassiumMin: number | null
  npkPotassiumMax: number | null
}

export interface SeuilAlerte extends BornesSeuil {
  id: number
  nomCulture: string
  saison: Saison
  typeSol: TypeSol | null
  estGenereParIA: boolean
  estActif: boolean
  typeCultureId: number
  typeCultureNom: string
  typeCultureVariete: string
}

export interface SeuilAlerteRequest extends BornesSeuil {
  nomCulture: string
  saison: Saison
  typeSol: TypeSol
}
