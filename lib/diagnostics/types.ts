// Types liés aux diagnostics IA (analyse d'image de plante par Gemini),
// alignés sur le backend (DiagnosticIAResponse).

import type { Page } from "@/lib/tickets/types"

export type { Page }

// Réponse renvoyée par l'API pour un diagnostic.
export interface DiagnosticIA {
  id: number
  imageUrl: string
  maladieDetectee: string
  confiance: string
  recommendation: string
  createdAt: string
  utilisateurId: number
  utilisateurNom: string
  utilisateurPrenom: string
}
