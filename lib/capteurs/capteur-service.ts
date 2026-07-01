// Service d'accès à l'API des capteurs.
// S'appuie sur le client HTTP commun (lib/api), qui joint le token JWT.
//
// Remarque : le backend n'expose pas de liste globale des capteurs. On
// reconstitue une vue d'ensemble en agrégeant les capteurs de chaque dispositif
// (getAllCapteurs).

import { apiFetch } from "@/lib/api"
import { getDispositifs } from "@/lib/dispositifs/dispositif-service"
import type { Capteur, CapteurRequest } from "./types"

// Crée un nouveau capteur.
export function creerCapteur(data: CapteurRequest): Promise<Capteur> {
  return apiFetch<Capteur>("/capteurs", { method: "POST", body: data })
}

// Récupère un capteur par son identifiant.
export function getCapteur(id: number): Promise<Capteur> {
  return apiFetch<Capteur>(`/capteurs/${id}`)
}

// Récupère les capteurs d'un dispositif.
export function getCapteursByDispositif(
  dispositifId: number,
): Promise<Capteur[]> {
  return apiFetch<Capteur[]>(`/capteurs/dispositif/${dispositifId}`)
}

// Vue d'ensemble : agrège les capteurs de tous les dispositifs.
export async function getAllCapteurs(): Promise<Capteur[]> {
  const dispositifs = await getDispositifs()
  const listes = await Promise.all(
    dispositifs.map((d) => getCapteursByDispositif(d.id)),
  )
  return listes.flat()
}

// Met à jour un capteur existant.
export function modifierCapteur(
  id: number,
  data: CapteurRequest,
): Promise<Capteur> {
  return apiFetch<Capteur>(`/capteurs/${id}`, { method: "PUT", body: data })
}

// Active un capteur.
export function activerCapteur(id: number): Promise<Capteur> {
  return apiFetch<Capteur>(`/capteurs/${id}/activer`, { method: "PATCH" })
}

// Désactive un capteur.
export function desactiverCapteur(id: number): Promise<Capteur> {
  return apiFetch<Capteur>(`/capteurs/${id}/desactiver`, { method: "PATCH" })
}

// Supprime (logiquement) un capteur.
export function supprimerCapteur(id: number): Promise<void> {
  return apiFetch<void>(`/capteurs/${id}`, { method: "DELETE" })
}
