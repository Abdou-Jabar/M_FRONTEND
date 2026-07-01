// Types liés aux organisations (tenants), alignés sur le backend.

export type StatutOrganisation = "EN_ATTENTE" | "ACTIVE" | "SUSPENDUE"

// Inscription publique : crée l'organisation + son premier administrateur.
export interface OrganisationInscriptionRequest {
  nomOrganisation: string
  nom: string
  prenom: string
  email: string
  password: string
  code: string
}

export interface Organisation {
  id: number
  nom: string
  statut: StatutOrganisation
  dateCreation: string
  adminId: number | null
  adminNomComplet: string | null
  adminEmail: string | null
}

export const STATUT_ORGANISATION_LABELS: Record<StatutOrganisation, string> = {
  EN_ATTENTE: "En attente",
  ACTIVE: "Active",
  SUSPENDUE: "Suspendue",
}

export const STATUT_ORGANISATION_BADGE: Record<
  StatutOrganisation,
  "default" | "secondary" | "outline"
> = {
  EN_ATTENTE: "outline",
  ACTIVE: "default",
  SUSPENDUE: "secondary",
}
