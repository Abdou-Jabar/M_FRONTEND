"use client"

// Layout de l'espace équipe AgriSmart (admin.agrismart.com/dashboard).
// Réutilise le même shell que l'espace client (sidebar + en-tête).
// Réservé aux rôles EQUIPE / TECHNICIEN.

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SessionExpiryListener } from "@/components/session-expiry-listener"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useAuth } from "@/lib/auth/use-auth"
import { ROLES_EQUIPE } from "@/lib/auth/types"

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Tableau de bord",
  "/dashboard/organisations": "Organisations",
  "/dashboard/techniciens": "Techniciens",
  "/dashboard/missions": "Missions",
  "/dashboard/utilisateurs": "Utilisateurs",
  "/dashboard/seuils": "Seuils de référence",
  "/dashboard/installation": "Installation",
  "/dashboard/mes-missions": "Mes missions",
  "/dashboard/parametres": "Paramètres du compte",
}

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isAuthenticated, isLoading } = useAuth()

  const estEquipe = user != null && ROLES_EQUIPE.includes(user.role)

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !estEquipe)) {
      router.replace("/login")
    } else if (!isLoading && user?.premiereConnexion) {
      // Changement de mot de passe obligatoire avant d'accéder au dashboard.
      router.replace("/changer-mot-de-passe")
    }
  }, [isLoading, isAuthenticated, estEquipe, user?.premiereConnexion, router])

  if (isLoading || !isAuthenticated || !estEquipe || user?.premiereConnexion) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center text-sm text-muted-foreground">
        Chargement…
      </div>
    )
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SessionExpiryListener />
        <SiteHeader title={PAGE_TITLES[pathname] ?? "Tableau de bord"} />
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
