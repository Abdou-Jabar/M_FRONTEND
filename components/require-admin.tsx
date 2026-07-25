"use client"

// Garde d'accès : réserve un sous-arbre de pages au rôle ADMIN (espace client).
// L'AGRICULTEUR qui tenterait d'atteindre ces pages par URL est renvoyé vers
// son tableau de bord. Les concepts techniques (dispositifs, capteurs) ne
// concernent pas l'agriculteur.

import { useEffect } from "react"
import { useRouter } from "next/navigation"

import { useAuth } from "@/lib/auth/use-auth"

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const autorise = user?.role === "ADMIN"

  useEffect(() => {
    if (!isLoading && user && !autorise) {
      router.replace("/dashboard")
    }
  }, [isLoading, user, autorise, router])

  if (isLoading || !user || !autorise) {
    return null
  }
  return <>{children}</>
}
