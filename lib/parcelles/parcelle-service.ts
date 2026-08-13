// Service d'accès à l'API des parcelles.
// S'appuie sur le client HTTP commun (lib/api), qui joint le token JWT.

import { apiFetch, ApiError } from "@/lib/api"
import { API_BASE_URL, API_PREFIX } from "@/lib/config"
import { getToken } from "@/lib/auth/storage"
import type { Parcelle, ParcelleRequest, TypeSolDeduction } from "./types"

// Déduit le type de sol à partir d'une localisation GPS (aperçu formulaire).
export function detecterTypeSol(
  latitude: number,
  longitude: number,
): Promise<TypeSolDeduction> {
  return apiFetch<TypeSolDeduction>(
    `/parcelles/type-sol?latitude=${latitude}&longitude=${longitude}`,
  )
}

// Crée une nouvelle parcelle (réservé à l'administrateur côté backend).
export function creerParcelle(data: ParcelleRequest): Promise<Parcelle> {
  return apiFetch<Parcelle>("/parcelles", {
    method: "POST",
    body: data,
  })
}

// Récupère la liste des parcelles actives.
export function getParcelles(): Promise<Parcelle[]> {
  return apiFetch<Parcelle[]>("/parcelles")
}

// Récupère les parcelles actives d'une organisation donnée.
// Utilisé par le flux d'installation (ADMIN de l'org ou TECHNICIEN affecté).
export function getParcellesByOrganisation(
  organisationId: number,
): Promise<Parcelle[]> {
  return apiFetch<Parcelle[]>(`/parcelles/organisation/${organisationId}`)
}

// Récupère une parcelle par son identifiant.
export function getParcelle(id: number): Promise<Parcelle> {
  return apiFetch<Parcelle>(`/parcelles/${id}`)
}

// Met à jour une parcelle existante.
export function modifierParcelle(
  id: number,
  data: ParcelleRequest,
): Promise<Parcelle> {
  return apiFetch<Parcelle>(`/parcelles/${id}`, {
    method: "PUT",
    body: data,
  })
}

// Supprime (désactive) une parcelle.
export function supprimerParcelle(id: number): Promise<void> {
  return apiFetch<void>(`/parcelles/${id}`, { method: "DELETE" })
}

// Télécharge le rapport d'exploitation PDF de la parcelle et déclenche
// l'enregistrement du fichier dans le navigateur. Fetch binaire manuel :
// apiFetch est réservé aux réponses JSON.
export async function telechargerRapportParcelle(
  id: number,
  jours = 30,
): Promise<void> {
  const token = getToken()
  const response = await fetch(
    `${API_BASE_URL}${API_PREFIX}/parcelles/${id}/rapport-pdf?jours=${jours}`,
    { headers: token ? { Authorization: `Bearer ${token}` } : undefined },
  )
  if (!response.ok) {
    throw new ApiError(
      "Impossible de générer le rapport PDF.",
      response.status,
    )
  }
  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  const lien = document.createElement("a")
  lien.href = url
  lien.download = `rapport-parcelle-${id}.pdf`
  document.body.appendChild(lien)
  lien.click()
  lien.remove()
  URL.revokeObjectURL(url)
}
