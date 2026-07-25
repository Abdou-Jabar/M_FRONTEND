// Service et types pour la carte géographique des parcelles.

import { apiFetch } from "@/lib/api"
import type { Environnement, TypeSol } from "./types"

export type NiveauAlerteMax = "AUCUNE" | "INFO" | "ATTENTION" | "CRITIQUE" | "URGENCE"

export interface ParcelleCartePoint {
  id: number
  nom: string
  description: string | null
  latitude: number
  longitude: number
  superficie: number
  typeSol: TypeSol
  environnement: Environnement
  organisationId: number | null
  organisationNom: string | null
  niveauAlerteMax: NiveauAlerteMax
  alertesNonResolues: number
  photoUrl: string | null
}

// GET /api/parcelles/carte
// Admin/Agriculteur : leurs parcelles. Superviseur/Technicien : toutes.
export function getParcellesPourCarte(): Promise<ParcelleCartePoint[]> {
  return apiFetch<ParcelleCartePoint[]>("/parcelles/carte")
}

// POST /api/parcelles/{id}/photo — upload d'une photo (multipart)
export function uploadPhotoParcelle(
  parcelleId: number,
  fichier: File,
): Promise<{ photoUrl: string | null }> {
  const formData = new FormData()
  formData.append("photo", fichier)
  return apiFetch(`/parcelles/${parcelleId}/photo`, {
    method: "POST",
    body: formData,
  })
}

// Couleur hexadécimale du marqueur selon le niveau d'alerte.
export function couleurMarqueur(niveau: NiveauAlerteMax): string {
  switch (niveau) {
    case "URGENCE":   return "#ef4444" // rouge
    case "CRITIQUE":  return "#f97316" // orange
    case "ATTENTION": return "#eab308" // jaune
    case "INFO":      return "#3b82f6" // bleu
    default:          return "#22c55e" // vert (aucune alerte)
  }
}
