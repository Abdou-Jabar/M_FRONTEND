// Bus SSE partagé : une seule connexion au flux /notifications/stream pour
// toute l'application, distribuée à tous les composants abonnés (cloche de
// notifications, graphiques temps réel…). La connexion est ouverte au premier
// abonnement et fermée au dernier désabonnement.

import {
  connecterNotificationsSse,
  type SseEvenement,
} from "./sse"

export type { SseEvenement }

type Abonne = (evenement: SseEvenement) => void

const abonnes = new Set<Abonne>()
let arreterConnexion: (() => void) | null = null

export function abonnerSse(abonne: Abonne): () => void {
  abonnes.add(abonne)

  // Premier abonné : ouvrir la connexion unique.
  if (abonnes.size === 1 && !arreterConnexion) {
    arreterConnexion = connecterNotificationsSse((evenement) => {
      for (const a of abonnes) a(evenement)
    })
  }

  return () => {
    abonnes.delete(abonne)
    // Dernier abonné parti : fermer la connexion.
    if (abonnes.size === 0 && arreterConnexion) {
      arreterConnexion()
      arreterConnexion = null
    }
  }
}

// Payload de l'événement "mesures" émis par le backend à chaque batch MQTT.
export interface SseMesuresPayload {
  parcelleId: number
  parcelleNom: string
  mesures: {
    capteurId: number
    capteurType: string
    unite: string
    valeur: number
    date: string
  }[]
}
