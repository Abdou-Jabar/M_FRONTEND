// Service d'accès à l'API tickets de support AgriSmart.
// Utilise le client HTTP commun (lib/api) qui injecte le token JWT.

import { apiFetch } from "@/lib/api"
import type {
  AffecterTicketRequest,
  AjouterCommentaireRequest,
  CommentaireTicketResponse,
  ContesterTicketRequest,
  CreerTicketRequest,
  NotificationTicketResponse,
  Page,
  RejeterTicketRequest,
  ResoudreTicketRequest,
  StatutTicket,
  TicketResponse,
} from "./types"

// ── Création ───────────────────────────────────────────────────────────────

/**
 * Crée un ticket avec des photos optionnelles (max 3).
 * Envoyé en multipart/form-data car les photos sont des fichiers.
 */
export function creerTicket(
  data: CreerTicketRequest,
  photos: File[] = [],
): Promise<TicketResponse> {
  const form = new FormData()
  form.append("titre", data.titre)
  form.append("description", data.description)
  if (data.parcelleId != null) {
    form.append("parcelleId", String(data.parcelleId))
  }
  for (const photo of photos) {
    form.append("photos", photo)
  }
  return apiFetch<TicketResponse>("/tickets", {
    method: "POST",
    body: form,
  })
}

// ── Lecture ────────────────────────────────────────────────────────────────

/** Détail complet d'un ticket. */
export function getTicket(id: number): Promise<TicketResponse> {
  return apiFetch<TicketResponse>(`/tickets/${id}`)
}

/**
 * Liste paginée des tickets de l'utilisateur courant.
 * La portée est déterminée par le rôle côté backend.
 * @param statut Filtre optionnel ; null = tous les statuts.
 * @param page   Page courante (0-indexée).
 * @param size   Nombre d'éléments par page.
 */
export function getTickets(
  statut: StatutTicket | null,
  page = 0,
  size = 10,
): Promise<Page<TicketResponse>> {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
  })
  if (statut) params.set("statut", statut)
  return apiFetch<Page<TicketResponse>>(`/tickets?${params.toString()}`)
}

// ── Transitions de statut ──────────────────────────────────────────────────

/** Admin : valide un ticket SOUMIS ou REOUVERT. */
export function validerTicket(id: number): Promise<TicketResponse> {
  return apiFetch<TicketResponse>(`/tickets/${id}/valider`, { method: "PATCH" })
}

/** Admin : rejette un ticket avec un motif obligatoire. */
export function rejeterTicket(
  id: number,
  data: RejeterTicketRequest,
): Promise<TicketResponse> {
  return apiFetch<TicketResponse>(`/tickets/${id}/rejeter`, {
    method: "PATCH",
    body: data,
  })
}

/** Superviseur : affecte un technicien et fixe la priorité. */
export function affecterTicket(
  id: number,
  data: AffecterTicketRequest,
): Promise<TicketResponse> {
  return apiFetch<TicketResponse>(`/tickets/${id}/affecter`, {
    method: "PATCH",
    body: data,
  })
}

/** Technicien : prend en charge le ticket (EN_COURS). */
export function prendreEnChargeTicket(id: number): Promise<TicketResponse> {
  return apiFetch<TicketResponse>(`/tickets/${id}/prendre-en-charge`, {
    method: "PATCH",
  })
}

/** Technicien : soumet le rapport d'intervention (RESOLU). */
export function resoudreTicket(
  id: number,
  data: ResoudreTicketRequest,
): Promise<TicketResponse> {
  return apiFetch<TicketResponse>(`/tickets/${id}/resoudre`, {
    method: "PATCH",
    body: data,
  })
}

/** Agriculteur/Admin : confirme la résolution (FERME). */
export function fermerTicket(id: number): Promise<TicketResponse> {
  return apiFetch<TicketResponse>(`/tickets/${id}/fermer`, { method: "PATCH" })
}

/** Agriculteur/Admin : conteste la résolution (REOUVERT). */
export function contesterTicket(
  id: number,
  data: ContesterTicketRequest,
): Promise<TicketResponse> {
  return apiFetch<TicketResponse>(`/tickets/${id}/contester`, {
    method: "PATCH",
    body: data,
  })
}

// ── Commentaires ───────────────────────────────────────────────────────────

/** Ajoute un commentaire sur un ticket ouvert. */
export function ajouterCommentaire(
  ticketId: number,
  data: AjouterCommentaireRequest,
): Promise<CommentaireTicketResponse> {
  return apiFetch<CommentaireTicketResponse>(`/tickets/${ticketId}/commentaires`, {
    method: "POST",
    body: data,
  })
}

/** Liste paginée des commentaires d'un ticket (ordre chronologique). */
export function getCommentaires(
  ticketId: number,
  page = 0,
  size = 50,
): Promise<Page<CommentaireTicketResponse>> {
  return apiFetch<Page<CommentaireTicketResponse>>(
    `/tickets/${ticketId}/commentaires?page=${page}&size=${size}`,
  )
}

// ── Notifications ──────────────────────────────────────────────────────────

/** Toutes les notifications de l'utilisateur courant. */
export function getNotifications(
  page = 0,
  size = 20,
): Promise<Page<NotificationTicketResponse>> {
  return apiFetch<Page<NotificationTicketResponse>>(
    `/tickets/notifications?page=${page}&size=${size}`,
  )
}

/** Notifications non lues seulement. */
export function getNotificationsNonLues(
  page = 0,
  size = 20,
): Promise<Page<NotificationTicketResponse>> {
  return apiFetch<Page<NotificationTicketResponse>>(
    `/tickets/notifications/non-lues?page=${page}&size=${size}`,
  )
}

/** Nombre de notifications non lues (badge). */
export function compterNotificationsNonLues(): Promise<number> {
  return apiFetch<number>("/tickets/notifications/compteur")
}

/** Marque toutes les notifications de l'utilisateur comme lues. */
export function marquerNotificationsLues(): Promise<void> {
  return apiFetch<void>("/tickets/notifications/marquer-lues", {
    method: "PATCH",
  })
}
