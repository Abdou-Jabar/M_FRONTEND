// Types du catalogue des types de culture, alignés sur le backend
// (entité TypeCulture, TypeCultureRequest, TypeCultureResponse).

import type { SeuilAlerte } from "@/lib/seuils/types"

export interface TypeCulture {
  id: number
  nom: string
  variete: string
  description: string
  seuils: SeuilAlerte[] | null
}

export interface TypeCultureRequest {
  nom: string
  variete: string
  description: string
}
