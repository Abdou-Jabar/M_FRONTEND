// Service d'accès à l'API des affectations technicien ↔ organisation.

import { apiFetch } from "@/lib/api"
import type { Affectation, StatutMission } from "./types"

// Superviseur : affecter un technicien à une organisation.
export function affecter(
  technicienId: number,
  organisationId: number,
): Promise<Affectation> {
  return apiFetch<Affectation>("/affectations", {
    method: "POST",
    body: { technicienId, organisationId },
  })
}

// Superviseur : retirer (désactiver) une affectation.
export function retirerAffectation(id: number): Promise<void> {
  return apiFetch<void>(`/affectations/${id}`, { method: "DELETE" })
}

// Superviseur : affectations d'un technicien.
export function getAffectationsTechnicien(
  technicienId: number,
): Promise<Affectation[]> {
  return apiFetch<Affectation[]>(`/affectations/technicien/${technicienId}`)
}

// Technicien : mes missions actives (tous statuts confondus).
export function getMesMissions(): Promise<Affectation[]> {
  return apiFetch<Affectation[]>("/affectations/mes-missions")
}

// Technicien : faire évoluer le statut de SA mission (kanban / liste).
export function changerStatutMission(
  id: number,
  statut: StatutMission,
): Promise<Affectation> {
  return apiFetch<Affectation>(`/affectations/${id}/statut`, {
    method: "PATCH",
    body: { statut },
  })
}

// Superviseur : toutes les missions actives (board global, lecture seule).
export function getToutesMissions(): Promise<Affectation[]> {
  return apiFetch<Affectation[]>("/affectations")
}
