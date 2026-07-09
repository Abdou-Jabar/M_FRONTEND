"use client"

// Écoute l'évènement de session expirée émis par le client API (api.ts) lorsqu'une
// requête authentifiée reçoit un 401. À sa réception : déconnexion (purge du token
// + état du store) et redirection vers la page de connexion.
//
// On le monte dans les layouts protégés (espace client et espace équipe).

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { SESSION_EXPIRED_EVENT } from "@/lib/api"
import { dureeAvantExpiration } from "@/lib/auth/storage"
import { useAuth } from "@/lib/auth/use-auth"

export function SessionExpiryListener() {
  const router = useRouter()
  const { logout } = useAuth()

  useEffect(() => {
    let dejaTraite = false

    function handleSessionExpired() {
      // Évite les déclenchements multiples (timer + 401 quasi simultanés).
      if (dejaTraite) return
      dejaTraite = true
      logout()
      toast.error("Votre session a expiré. Veuillez vous reconnecter.")
      // Le proxy réécrit "/login" vers /app/login ou /admin/login selon le
      // sous-domaine : chaque utilisateur revient sur SA page de connexion.
      router.replace("/login")
    }

    // 1. Réactif : un 401 sur une requête authentifiée (émis par api.ts).
    window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired)

    // 2. Proactif : on programme la déconnexion à l'instant exact d'expiration
    //    du token, même si l'utilisateur reste inactif (aucune requête).
    const restant = dureeAvantExpiration()
    let timer: ReturnType<typeof setTimeout> | undefined
    if (restant !== null) {
      timer = setTimeout(handleSessionExpired, Math.max(0, restant))
    }

    return () => {
      window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired)
      if (timer) clearTimeout(timer)
    }
  }, [logout, router])

  return null
}
