// Client HTTP minimal pour parler à l'API Spring Boot.
//
// - Préfixe automatiquement les requêtes avec l'URL de base de l'API.
// - Ajoute l'en-tête Authorization: Bearer <token> si un token est présent.
// - Normalise la gestion d'erreurs via la classe ApiError.

import { API_BASE_URL, API_PREFIX } from "./config"
import { getToken } from "./auth/storage"

// Nom de l'évènement émis sur window lorsqu'une requête authentifiée reçoit un
// 401 (session expirée). Écouté par SessionExpiryListener pour déconnecter et
// rediriger vers la page de connexion.
export const SESSION_EXPIRED_EVENT = "agrismart:session-expired"

// Erreur applicative renvoyée par l'API. On y conserve le code HTTP et,
// si disponible, le message renvoyé par le backend (GlobalExceptionHandler).
export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

type ApiFetchOptions = Omit<RequestInit, "body"> & {
  // Corps JSON ; sérialisé automatiquement.
  body?: unknown
  // Joindre le token JWT (vrai par défaut). Mettre à false pour les routes publiques.
  auth?: boolean
}

// Extrait un message d'erreur lisible à partir du corps de la réponse.
async function extractErrorMessage(response: Response): Promise<string> {
  try {
    const data = await response.clone().json()
    // Le backend renvoie soit { message }, soit { erreurs: { champ: msg } }.
    if (typeof data?.message === "string") return data.message
    if (data?.erreurs && typeof data.erreurs === "object") {
      const premier = Object.values(data.erreurs)[0]
      if (typeof premier === "string") return premier
    }
  } catch {
    // Corps non JSON : on retombe sur un message générique plus bas.
  }
  if (response.status === 401) return "Email ou mot de passe incorrect"
  return "Une erreur est survenue. Veuillez réessayer."
}

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { body, auth = true, headers, ...rest } = options

  const finalHeaders = new Headers(headers)
  if (body !== undefined) {
    finalHeaders.set("Content-Type", "application/json")
  }

  if (auth) {
    const token = getToken()
    if (token) {
      finalHeaders.set("Authorization", `Bearer ${token}`)
    }
  }

  const response = await fetch(`${API_BASE_URL}${API_PREFIX}${path}`, {
    ...rest,
    headers: finalHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    // 401 sur une requête authentifiée = token absent/expiré/invalide.
    // On signale l'expiration de session : un écouteur global (voir
    // SessionExpiryListener) se charge de déconnecter et de rediriger.
    // Note : le login utilise auth=false, donc un 401 d'identifiants
    // incorrects ne déclenche PAS cet évènement.
    if (response.status === 401 && auth && typeof window !== "undefined") {
      window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT))
    }
    throw new ApiError(await extractErrorMessage(response), response.status)
  }

  // 204 No Content : pas de corps à parser.
  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}
