// Service d'accès à l'API des organisations.

import { apiFetch } from "@/lib/api"
import type {
  Organisation,
  OrganisationInscriptionRequest,
  StatutOrganisation,
} from "./types"

// Étape 1 de l'inscription : demande d'un code de vérification par email.
export function demanderCodeInscription(email: string): Promise<void> {
  return apiFetch<void>("/organisations/demander-code", {
    method: "POST",
    body: { email },
    auth: false,
  })
}

// Étape 2 : inscription publique d'une organisation (route publique, sans token).
export function inscrireOrganisation(
  data: OrganisationInscriptionRequest,
): Promise<Organisation> {
  return apiFetch<Organisation>("/organisations/inscription", {
    method: "POST",
    body: data,
    auth: false,
  })
}

// Liste des organisations (espace équipe), filtrable par statut.
export function getOrganisations(
  statut?: StatutOrganisation,
): Promise<Organisation[]> {
  const query = statut ? `?statut=${statut}` : ""
  return apiFetch<Organisation[]>(`/organisations${query}`)
}

export function getOrganisation(id: number): Promise<Organisation> {
  return apiFetch<Organisation>(`/organisations/${id}`)
}

export function validerOrganisation(id: number): Promise<Organisation> {
  return apiFetch<Organisation>(`/organisations/${id}/valider`, {
    method: "PATCH",
  })
}

export function suspendreOrganisation(id: number): Promise<Organisation> {
  return apiFetch<Organisation>(`/organisations/${id}/suspendre`, {
    method: "PATCH",
  })
}

export function reactiverOrganisation(id: number): Promise<Organisation> {
  return apiFetch<Organisation>(`/organisations/${id}/reactiver`, {
    method: "PATCH",
  })
}
