// Service d'accès à l'API des diagnostics IA (Gemini).
// S'appuie sur le client HTTP commun (lib/api), qui joint le token JWT.

import { apiFetch } from "@/lib/api"
import type { DiagnosticIA, Page } from "./types"

// Envoie une photo de plante pour analyse (multipart). L'appel peut prendre
// plusieurs secondes : Gemini analyse l'image côté backend.
export function analyserImage(
  image: File,
  utilisateurId: number,
): Promise<DiagnosticIA> {
  const form = new FormData()
  form.append("image", image)
  form.append("utilisateurId", String(utilisateurId))
  return apiFetch<DiagnosticIA>("/diagnostics", {
    method: "POST",
    body: form,
  })
}

// Récupère un diagnostic par son identifiant.
export function getDiagnostic(id: number): Promise<DiagnosticIA> {
  return apiFetch<DiagnosticIA>(`/diagnostics/${id}`)
}

// Historique paginé des diagnostics d'un utilisateur.
export function getDiagnosticsByUtilisateur(
  utilisateurId: number,
  page = 0,
  size = 10,
): Promise<Page<DiagnosticIA>> {
  return apiFetch<Page<DiagnosticIA>>(
    `/diagnostics/utilisateur/${utilisateurId}?page=${page}&size=${size}`,
  )
}
