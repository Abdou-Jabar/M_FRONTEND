// Service d'accès à l'API des actionneurs.
// S'appuie sur le client HTTP commun (lib/api), qui joint le token JWT.

import { apiFetch } from "@/lib/api"
import type { Page } from "@/lib/tickets/types"
import type {
  Actionneur,
  ActionneurRequest,
  CommandeActionneur,
  CommandeRequest,
} from "./types"

// Crée un nouvel actionneur.
export function creerActionneur(data: ActionneurRequest): Promise<Actionneur> {
  return apiFetch<Actionneur>("/actionneurs", { method: "POST", body: data })
}

// Récupère un actionneur par son identifiant.
export function getActionneur(id: number): Promise<Actionneur> {
  return apiFetch<Actionneur>(`/actionneurs/${id}`)
}

// Récupère les actionneurs d'un dispositif.
export function getActionneursByDispositif(
  dispositifId: number,
): Promise<Actionneur[]> {
  return apiFetch<Actionneur[]>(`/actionneurs/dispositif/${dispositifId}`)
}

// Récupère tous les actionneurs actifs d'une parcelle.
export function getActionneursByParcelle(
  parcelleId: number,
): Promise<Actionneur[]> {
  return apiFetch<Actionneur[]>(`/actionneurs/parcelle/${parcelleId}`)
}

// Met à jour un actionneur existant.
export function modifierActionneur(
  id: number,
  data: ActionneurRequest,
): Promise<Actionneur> {
  return apiFetch<Actionneur>(`/actionneurs/${id}`, {
    method: "PUT",
    body: data,
  })
}

// Supprime (logiquement) un actionneur.
export function supprimerActionneur(id: number): Promise<void> {
  return apiFetch<void>(`/actionneurs/${id}`, { method: "DELETE" })
}

// Active/désactive la régulation automatique par seuils.
export function changerModeAuto(
  id: number,
  modeAuto: boolean,
): Promise<Actionneur> {
  return apiFetch<Actionneur>(`/actionneurs/${id}/mode-auto`, {
    method: "PATCH",
    body: { modeAuto },
  })
}

// Envoie une commande ON/OFF (202 Accepted : l'état réel est confirmé par
// l'ACK MQTT de l'ESP32 — rafraîchir l'actionneur quelques secondes après).
export function envoyerCommande(
  id: number,
  data: CommandeRequest,
): Promise<void> {
  return apiFetch<void>(`/actionneurs/${id}/commande`, {
    method: "POST",
    body: data,
  })
}

// Historique paginé des commandes confirmées (ACK) de l'actionneur.
export function getHistoriqueCommandes(
  id: number,
  page = 0,
  size = 10,
): Promise<Page<CommandeActionneur>> {
  return apiFetch<Page<CommandeActionneur>>(
    `/actionneurs/${id}/commandes?page=${page}&size=${size}`,
  )
}

// Historique paginé des commandes de tous les actionneurs d'une parcelle.
export function getHistoriqueCommandesParcelle(
  parcelleId: number,
  page = 0,
  size = 10,
): Promise<Page<CommandeActionneur>> {
  return apiFetch<Page<CommandeActionneur>>(
    `/actionneurs/parcelle/${parcelleId}/commandes?page=${page}&size=${size}`,
  )
}
