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
import { useAuth } from "@/lib/auth/use-auth"

export function SessionExpiryListener() {
  const router = useRouter()
  const { logout } = useAuth()

  useEffect(() => {
    function handleSessionExpired() {
      logout()
      toast.error("Votre session a expiré. Veuillez vous reconnecter.")
      router.replace("/login")
    }

    window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired)
    return () => {
      window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired)
    }
  }, [logout, router])

  return null
}
