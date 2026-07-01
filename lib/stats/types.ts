// Types des statistiques du tableau de bord équipe, alignés sur
// DashboardStatsResponse et PointInscriptionDTO côté backend.

// Un point de la série temporelle d'inscriptions (par jour).
export interface PointInscription {
  date: string // ISO yyyy-MM-dd
  organisations: number
  utilisateurs: number
}

export interface DashboardStats {
  // Organisations
  totalOrganisations: number
  tendanceOrganisations: number
  organisationsActives: number
  organisationsEnAttente: number
  organisationsSuspendues: number

  // Utilisateurs clients (ADMIN + AGRICULTEUR)
  totalUtilisateurs: number
  tendanceUtilisateurs: number

  // Techniciens
  totalTechniciens: number
  tendanceTechniciens: number

  // Répartition clients
  totalAdmins: number
  totalAgriculteurs: number

  // Série temporelle (90 derniers jours)
  inscriptions: PointInscription[]
}

// ── Dashboard client (ADMIN / AGRICULTEUR) ────────────────────

import type { TypeCapteur } from "@/lib/capteurs/types"

// Un point d'une série de valeurs mesurées.
export interface MesurePoint {
  date: string // ISO
  valeur: number
}

// Aperçu d'un capteur : série de valeurs réellement mesurées sur une parcelle.
export interface ApercuCapteur {
  capteurId: number
  capteurNom: string
  type: TypeCapteur
  unite: string
  valeurMin: number
  valeurMax: number
  parcelleId: number | null
  parcelleNom: string
  points: MesurePoint[]
}

export interface DashboardClient {
  // Matériel
  totalParcelles: number
  totalDispositifs: number
  dispositifsEnLigne: number
  dispositifsHorsLigne: number
  totalCapteurs: number

  // Alertes
  alertesActives: number

  // Aperçu aléatoire de mesures par facteur/parcelle (change à chaque accès)
  apercuCapteurs: ApercuCapteur[]
}
