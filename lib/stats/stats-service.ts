import { apiFetch } from "@/lib/api"
import type { DashboardClient, DashboardStats } from "./types"

// Récupère les statistiques agrégées du tableau de bord équipe.
// Réservé aux comptes SUPERVISEUR / TECHNICIEN côté backend.
export function getDashboardStats(): Promise<DashboardStats> {
  return apiFetch<DashboardStats>("/stats/dashboard")
}

// Récupère les statistiques du tableau de bord client (périmètre de
// l'utilisateur). Réservé aux comptes ADMIN / AGRICULTEUR côté backend.
export function getDashboardClient(): Promise<DashboardClient> {
  return apiFetch<DashboardClient>("/stats/dashboard-client")
}
