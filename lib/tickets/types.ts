// Types liés aux tickets de support, alignés sur le backend Spring Boot.

// ── Enums ──────────────────────────────────────────────────────────────────

export type StatutTicket =
  | "SOUMIS"
  | "VALIDE"
  | "REJETE"
  | "AFFECTE"
  | "EN_COURS"
  | "RESOLU"
  | "FERME"
  | "REOUVERT"

export type PrioriteTicket = "BASSE" | "MOYENNE" | "HAUTE" | "CRITIQUE"

// ── Entités réponse ────────────────────────────────────────────────────────

export interface PhotoTicket {
  id: number
  url: string
  nomFichierOriginal: string | null
  uploadedAt: string
}

export interface TicketResponse {
  id: number
  titre: string
  description: string
  statut: StatutTicket
  priorite: PrioriteTicket | null
  motifRejet: string | null
  rapportIntervention: string | null

  createdAt: string
  updatedAt: string
  resolvedAt: string | null
  closedAt: string | null

  createurId: number
  createurNom: string
  createurPrenom: string
  createurRole: string

  technicienId: number | null
  technicienNom: string | null
  technicienPrenom: string | null

  parcelleId: number | null
  parcelleNom: string | null

  photos: PhotoTicket[]
  nombreCommentaires: number
}

export interface CommentaireTicketResponse {
  id: number
  contenu: string
  createdAt: string
  auteurId: number
  auteurNom: string
  auteurPrenom: string
  auteurRole: string
}

export interface NotificationTicketResponse {
  id: number
  message: string
  lu: boolean
  createdAt: string
  ticketId: number
  ticketTitre: string
}

// ── Pagination (aligné sur Page<T> Spring Data) ────────────────────────────

export interface Page<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number   // page courante (0-indexée)
  size: number
}

// ── Requêtes ───────────────────────────────────────────────────────────────

export interface CreerTicketRequest {
  titre: string
  description: string
  parcelleId?: number | null
}

export interface RejeterTicketRequest {
  motifRejet: string
}

export interface AffecterTicketRequest {
  technicienId: number
  priorite: PrioriteTicket
}

export interface ResoudreTicketRequest {
  rapportIntervention: string
}

export interface ContesterTicketRequest {
  motif: string
}

export interface AjouterCommentaireRequest {
  contenu: string
}

// ── Labels & styles ────────────────────────────────────────────────────────

export const STATUT_LABELS: Record<StatutTicket, string> = {
  SOUMIS:    "Soumis",
  VALIDE:    "Validé",
  REJETE:    "Rejeté",
  AFFECTE:   "Affecté",
  EN_COURS:  "En cours",
  RESOLU:    "Résolu",
  FERME:     "Fermé",
  REOUVERT:  "Réouvert",
}

// Classe CSS Tailwind appliquée sur le badge selon le statut.
export const STATUT_VARIANT: Record<
  StatutTicket,
  "default" | "secondary" | "destructive" | "outline"
> = {
  SOUMIS:    "outline",
  VALIDE:    "secondary",
  REJETE:    "destructive",
  AFFECTE:   "default",
  EN_COURS:  "default",
  RESOLU:    "secondary",
  FERME:     "secondary",
  REOUVERT:  "outline",
}

// Couleur de point/point indicateur selon le statut.
export const STATUT_DOT: Record<StatutTicket, string> = {
  SOUMIS:    "bg-slate-400",
  VALIDE:    "bg-blue-500",
  REJETE:    "bg-red-500",
  AFFECTE:   "bg-amber-500",
  EN_COURS:  "bg-orange-500",
  RESOLU:    "bg-emerald-500",
  FERME:     "bg-green-600",
  REOUVERT:  "bg-purple-500",
}

export const PRIORITE_LABELS: Record<PrioriteTicket, string> = {
  BASSE:    "Basse",
  MOYENNE:  "Moyenne",
  HAUTE:    "Haute",
  CRITIQUE: "Critique",
}

export const PRIORITE_VARIANT: Record<
  PrioriteTicket,
  "default" | "secondary" | "destructive" | "outline"
> = {
  BASSE:    "secondary",
  MOYENNE:  "outline",
  HAUTE:    "default",
  CRITIQUE: "destructive",
}

export const PRIORITE_OPTIONS: { value: PrioriteTicket; label: string }[] = [
  { value: "BASSE",    label: "Basse" },
  { value: "MOYENNE",  label: "Moyenne" },
  { value: "HAUTE",    label: "Haute" },
  { value: "CRITIQUE", label: "Critique" },
]

// Filtres de statut disponibles dans la liste des tickets.
export const STATUT_FILTRE_OPTIONS: {
  value: StatutTicket | "TOUS"
  label: string
}[] = [
  { value: "TOUS",    label: "Tous" },
  { value: "SOUMIS",   label: "Soumis" },
  { value: "VALIDE",   label: "Validés" },
  { value: "REJETE",   label: "Rejetés" },
  { value: "AFFECTE",  label: "Affectés" },
  { value: "EN_COURS", label: "En cours" },
  { value: "RESOLU",   label: "Résolus" },
  { value: "FERME",    label: "Fermés" },
  { value: "REOUVERT", label: "Réouverts" },
]
