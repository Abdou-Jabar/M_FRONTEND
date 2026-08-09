// Client SSE (Server-Sent Events) pour les notifications temps réel.
//
// EventSource natif ne permet pas d'envoyer le header Authorization : on
// utilise fetch en streaming et on parse le flux text/event-stream à la main
// (format simple : lignes "event:" / "data:", événements séparés par une
// ligne vide). Reconnexion automatique avec backoff.

import { API_BASE_URL, API_PREFIX } from "@/lib/config"
import { getToken } from "@/lib/auth/storage"

export interface SseEvenement {
  // "connected" | "alerte" | "notification-ticket"
  type: string
  // Payload JSON parsé (ou chaîne brute si non JSON).
  data: unknown
}

export type SseCallback = (evenement: SseEvenement) => void

// Délais de reconnexion progressifs (ms).
const BACKOFF_MS = [2_000, 5_000, 15_000, 30_000, 60_000]

/**
 * Ouvre le flux SSE authentifié et appelle `onEvenement` pour chaque
 * événement reçu. Retourne une fonction d'arrêt (à appeler au démontage).
 * En cas d'échec de connexion, réessaie indéfiniment (backoff progressif)
 * tant que l'arrêt n'a pas été demandé.
 */
export function connecterNotificationsSse(onEvenement: SseCallback): () => void {
  let arrete = false
  let controller: AbortController | null = null
  let tentative = 0
  let timer: ReturnType<typeof setTimeout> | null = null

  async function boucle() {
    while (!arrete) {
      const token = getToken()
      if (!token) return // non connecté : rien à écouter

      controller = new AbortController()
      try {
        const response = await fetch(
          `${API_BASE_URL}${API_PREFIX}/notifications/stream`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "text/event-stream",
            },
            signal: controller.signal,
            cache: "no-store",
          },
        )

        if (!response.ok || !response.body) {
          throw new Error(`SSE HTTP ${response.status}`)
        }

        tentative = 0 // connexion établie : réinitialiser le backoff
        await lireFlux(response.body, onEvenement)
        // Flux terminé proprement (timeout serveur ~30 min) : on se
        // reconnecte immédiatement.
      } catch {
        if (arrete) return
        // Échec : attendre avant de retenter.
        const delai =
          BACKOFF_MS[Math.min(tentative, BACKOFF_MS.length - 1)]
        tentative++
        await new Promise<void>((resolve) => {
          timer = setTimeout(resolve, delai)
        })
      }
    }
  }

  void boucle()

  return () => {
    arrete = true
    if (timer) clearTimeout(timer)
    controller?.abort()
  }
}

// Parse le flux text/event-stream et émet chaque événement complet.
async function lireFlux(
  body: ReadableStream<Uint8Array>,
  onEvenement: SseCallback,
): Promise<void> {
  const reader = body.getReader()
  const decoder = new TextDecoder()
  let tampon = ""

  try {
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      tampon += decoder.decode(value, { stream: true })

      // Les événements sont séparés par une ligne vide.
      let separation: number
      while ((separation = tampon.indexOf("\n\n")) >= 0) {
        const bloc = tampon.slice(0, separation)
        tampon = tampon.slice(separation + 2)
        const evenement = parserBloc(bloc)
        if (evenement) onEvenement(evenement)
      }
    }
  } finally {
    reader.releaseLock()
  }
}

function parserBloc(bloc: string): SseEvenement | null {
  let type = "message"
  const lignesData: string[] = []

  for (const ligne of bloc.split("\n")) {
    if (ligne.startsWith("event:")) {
      type = ligne.slice(6).trim()
    } else if (ligne.startsWith("data:")) {
      lignesData.push(ligne.slice(5).trim())
    }
    // Les lignes ":" (commentaires/keep-alive) et "id:" sont ignorées.
  }

  if (lignesData.length === 0) return null

  const brut = lignesData.join("\n")
  let data: unknown = brut
  try {
    data = JSON.parse(brut)
  } catch {
    // Donnée non JSON (ex. "ok" de l'événement connected) : chaîne brute.
  }
  return { type, data }
}
