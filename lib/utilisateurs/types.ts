// Types liés aux utilisateurs, alignés sur le backend.

import type { Role } from "@/lib/auth/types"

// Corps envoyé à POST/PUT /api/utilisateurs.
// Le mot de passe est généré côté backend et envoyé par email.
export interface UtilisateurRequest {
  nom: string
  prenom: string
  email: string
  role: Role
}

export interface Utilisateur {
  id: number
  nom: string
  prenom: string
  email: string
  role: Role
  photoUrl: string | null
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
