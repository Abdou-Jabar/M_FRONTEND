// Appels API du catalogue des types de culture (gestion superviseur).

import { apiFetch } from "@/lib/api"
import type { TypeCulture, TypeCultureRequest } from "./types"

export function getTypesCulture(): Promise<TypeCulture[]> {
  return apiFetch<TypeCulture[]>("/types-culture")
}

export function getTypeCulture(id: number): Promise<TypeCulture> {
  return apiFetch<TypeCulture>(`/types-culture/${id}`)
}

export function creerTypeCulture(
  data: TypeCultureRequest,
): Promise<TypeCulture> {
  return apiFetch<TypeCulture>("/types-culture", {
    method: "POST",
    body: data,
  })
}

export function modifierTypeCulture(
  id: number,
  data: TypeCultureRequest,
): Promise<TypeCulture> {
  return apiFetch<TypeCulture>(`/types-culture/${id}`, {
    method: "PUT",
    body: data,
  })
}

export function supprimerTypeCulture(id: number): Promise<void> {
  return apiFetch<void>(`/types-culture/${id}`, { method: "DELETE" })
}
