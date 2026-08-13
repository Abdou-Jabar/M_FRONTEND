// Types liés aux utilisateurs, alignés sur le backend.

import type { Role } from "@/lib/auth/types"

// Corps envoyé à POST/PUT /api/utilisateurs.
// Le mot de passe est généré côté backend et envoyé par email.
export interface UtilisateurRequest {
  nom: string
  prenom: string
  email: string
  role: Role
  // Parcelles à affecter dès la création (optionnel, comptes clients).
  parcelleIds?: number[]
}

export interface Utilisateur {
  id: number
  nom: string
  prenom: string
  email: string
  role: Role
  photoUrl: string | null
  telephone: string | null
  actif: boolean
  estVerifie: boolean
  estSupprime: boolean
  organisationId: number | null
  organisationNom: string | null
  dateCreation: string
}

// Mise à jour du profil de l'utilisateur connecté (email non modifiable).
export interface ProfilUpdateRequest {
  nom: string
  prenom: string
  // Format international (ex. +22890123456) — requis pour les alertes SMS.
  telephone?: string
}

// ── Vue détaillée d'un utilisateur ────────────────────────────

// Affectation de parcelle (ParcelleUtilisateurResponse côté backend).
export interface ParcelleAffectation {
  id: number
  dateAffection: string
  dateResiliation: string | null
  utilisateurId: number
  utilisateurNom: string
  utilisateurPrenom: string
  utilisateurEmail: string
  parcelleId: number
  parcelleNom: string
}

export interface TicketResume {
  id: number
  titre: string
  statut: string
  createdAt: string
  parcelleNom: string | null
}

export interface CommandeResume {
  id: number
  actionneurNom: string
  actionneurType: string | null
  etatDemande: boolean
  dateCommande: string
}

// Réponse de GET /api/utilisateurs/{id}/detail.
export interface UtilisateurDetail {
  utilisateur: Utilisateur
  parcelles: ParcelleAffectation[]
  tickets: TicketResume[]
  nbTickets: number
  commandes: CommandeResume[]
  nbDiagnostics: number
}

// Libellés lisibles des rôles.
export const ROLE_LABELS: Record<Role, string> = {
  SUPERVISEUR: "Superviseur",
  TECHNICIEN: "Technicien",
  ADMIN: "Administrateur",
  AGRICULTEUR: "Agriculteur",
}

// Rôles qu'un ADMIN d'organisation peut attribuer.
export const ROLES_ATTRIBUABLES_ADMIN: { value: Role; label: string }[] = [
  { value: "ADMIN", label: ROLE_LABELS.ADMIN },
  { value: "AGRICULTEUR", label: ROLE_LABELS.AGRICULTEUR },
]
