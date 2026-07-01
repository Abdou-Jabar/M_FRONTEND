"use client"

// Layout de l'espace dashboard (app.agrismart.com/dashboard).
// - Protège l'accès : redirige vers /login si l'utilisateur n'est pas connecté.
// - Compose le shell : sidebar shadcn + en-tête + zone de contenu.

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { OrganisationAttente } from "@/components/organisation-attente"
import { SessionExpiryListener } from "@/components/session-expiry-listener"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useAuth } from "@/lib/auth/use-auth"
import { ROLES_CLIENT } from "@/lib/auth/types"

// Titre de l'en-tête en fonction de la route courante.
const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Tableau de bord",
  "/dashboard/parcelles": "Parcelles",
  "/dashboard/dispositifs": "Dispositifs",
  "/dashboard/capteurs": "Capteurs",
  "/dashboard/utilisateurs": "Utilisateurs",
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isAuthenticated, isLoading } = useAuth()

  const estClient = user != null && ROLES_CLIENT.includes(user.role)

  // Redirection une fois l'état d'auth connu (après lecture du localStorage).
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !estClient)) {
      router.replace("/login")
    } else if (!isLoading && user?.premiereConnexion) {
      // Changement de mot de passe obligatoire avant d'accéder au dashboard.
      router.replace("/changer-mot-de-passe")
    }
  }, [isLoading, isAuthenticated, estClient, user?.premiereConnexion, router])

  // Tant qu'on ne sait pas (ou si non autorisé), on n'affiche pas le dashboard.
  if (isLoading || !isAuthenticated || !estClient || user?.premiereConnexion) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center text-sm text-muted-foreground">
        Chargement…
      </div>
    )
  }

  // Organisation pas encore validée (ou suspendue) : page d'attente
  // au lieu du tableau de bord.
  if (user && user.organisationStatut !== "ACTIVE") {
    return (
      <OrganisationAttente
        statut={user.organisationStatut}
        organisationNom={user.organisationNom}
      />
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
