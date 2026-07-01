// Service d'accès à l'API des dispositifs.
// S'appuie sur le client HTTP commun (lib/api), qui joint le token JWT.

import { apiFetch } from "@/lib/api"
import type { Dispositif, DispositifRequest } from "./types"

// Crée un nouveau dispositif.
export function creerDispositif(data: DispositifRequest): Promise<Dispositif> {
  return apiFetch<Dispositif>("/dispositifs", {
    method: "POST",
    body: data,
  })
}

// Récupère la liste des dispositifs (non supprimés).
export function getDispositifs(): Promise<Dispositif[]> {
  return apiFetch<Dispositif[]>("/dispositifs")
}

// Récupère un dispositif par son identifiant.
export function getDispositif(id: number): Promise<Dispositif> {
  return apiFetch<Dispositif>(`/dispositifs/${id}`)
}

// Récupère les dispositifs d'une parcelle.
export function getDispositifsByParcelle(
  parcelleId: number,
): Promise<Dispositif[]> {
  return apiFetch<Dispositif[]>(`/dispositifs/parcelle/${parcelleId}`)
}

// Met à jour un dispositif existant.
export function modifierDispositif(
  id: number,
  data: DispositifRequest,
): Promise<Dispositif> {
  return apiFetch<Dispositif>(`/dispositifs/${id}`, {
    method: "PUT",
    body: data,
  })
}

// Supprime (logiquement) un dispositif.
export function supprimerDispositif(id: number): Promise<void> {
  return apiFetch<void>(`/dispositifs/${id}`, { method: "DELETE" })
}
