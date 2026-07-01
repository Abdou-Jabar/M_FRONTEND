// Types et énumérations liés aux dispositifs, alignés sur le backend Spring Boot
// (entité Dispositif, DispositifRequest, DispositifResponse).

// Statut d'un dispositif — voir StatutDispositifEnum côté backend.
export type StatutDispositif = "ONLINE" | "OFFLINE" | "MAINTENANCE"

// Corps envoyé à POST/PUT /api/dispositifs.
// Le statut, la batterie et le dernier ping sont gérés côté backend.
export interface DispositifRequest {
  nom: string
  adresseMac: string
  description?: string
  parcelleId: number
}

// Réponse renvoyée par l'API pour un dispositif.
export interface Dispositif {
  id: number
  nom: string
  adresseMac: string
  description?: string
  statut: StatutDispositif
  batteriePct: number
  dateCreation: string
  dernierePing: string | null
  parcelleId: number
  parcelleNom: string
}

// Libellés lisibles (français) et variantes de badge pour l'affichage du statut.
export const STATUT_DISPOSITIF_LABELS: Record<StatutDispositif, string> = {
  ONLINE: "En ligne",
  OFFLINE: "Hors ligne",
  MAINTENANCE: "Maintenance",
}

// Variante visuelle du badge selon le statut (cf. components/ui/badge).
export const STATUT_DISPOSITIF_BADGE: Record<
  StatutDispositif,
  "default" | "secondary" | "outline"
> = {
  ONLINE: "default",
  OFFLINE: "secondary",
  MAINTENANCE: "outline",
}
