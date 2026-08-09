// Service d'accès à l'API des actionneurs.
// S'appuie sur le client HTTP commun (lib/api), qui joint le token JWT.

import { apiFetch } from "@/lib/api"
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

// Historique des commandes confirmées (ACK) de l'actionneur.
export function getHistoriqueCommandes(
  id: number,
): Promise<CommandeActionneur[]> {
  return apiFetch<CommandeActionneur[]>(`/actionneurs/${id}/commandes`)
}
