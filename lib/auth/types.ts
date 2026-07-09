// Types liés à l'authentification, alignés sur les DTO du backend Spring Boot.

// Rôles utilisateur (enum RoleEnum côté backend).
// - SUPERVISEUR / TECHNICIEN : équipe AgriSmart (espace admin)
// - ADMIN / AGRICULTEUR : clients d'une organisation (espace app)
export type Role = "SUPERVISEUR" | "TECHNICIEN" | "ADMIN" | "AGRICULTEUR"

// Statut de l'organisation (StatutOrganisationEnum côté backend).
export type StatutOrganisation = "EN_ATTENTE" | "ACTIVE" | "SUSPENDUE"

// Corps de la requête de connexion (LoginRequest côté backend).
export interface LoginRequest {
  email: string
  password: string
}

// Corps de la requête de changement de mot de passe.
export interface ChangerMotDePasseRequest {
  ancienMotDePasse: string
  nouveauMotDePasse: string
}

// Réponse renvoyée par POST /api/auth/login (AuthResponse côté backend).
export interface AuthResponse {
  token: string
  utilisateurId: number
  nom: string
  prenom: string
  email: string
  role: Role
  photoUrl: string | null
  premiereConnexion: boolean
  emailVerifie: boolean
  organisationId: number | null
  organisationNom: string | null
  organisationStatut: StatutOrganisation | null
}

// Utilisateur connecté tel que conservé côté client (la réponse sans le token).
export interface AuthUser {
  utilisateurId: number
  nom: string
  prenom: string
  email: string
  role: Role
  photoUrl: string | null
  premiereConnexion: boolean
  emailVerifie: boolean
  organisationId: number | null
  organisationNom: string | null
  organisationStatut: StatutOrganisation | null
}

// Rôles de l'équipe AgriSmart (espace admin).
export const ROLES_EQUIPE: Role[] = ["SUPERVISEUR", "TECHNICIEN"]

// Rôles clients (espace app).
export const ROLES_CLIENT: Role[] = ["ADMIN", "AGRICULTEUR"]
