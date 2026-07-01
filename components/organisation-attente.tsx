"use client"

// Page affichée à un utilisateur dont l'organisation n'est pas encore ACTIVE :
// - EN_ATTENTE : en attente de validation par l'équipe AgriSmart
// - SUSPENDUE  : organisation suspendue
// L'utilisateur est authentifié mais n'a pas encore accès au tableau de bord.

import { useRouter } from "next/navigation"
import { Clock, LogOut, Ban } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth/use-auth"
import type { StatutOrganisation } from "@/lib/auth/types"

export function OrganisationAttente({
  statut,
  organisationNom,
}: {
  statut: StatutOrganisation | null
  organisationNom: string | null
}) {
  const router = useRouter()
  const { logout } = useAuth()

  const suspendue = statut === "SUSPENDUE"
  const nom = organisationNom ?? "votre organisation"

  function handleLogout() {
    logout()
    router.replace("/login")
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-muted p-6">
      <div className="flex w-full max-w-md flex-col items-center gap-5 rounded-2xl border bg-card p-8 text-center shadow-sm">
        <span
          className={
            suspendue
              ? "flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive"
              : "flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary"
          }
        >
          {suspendue ? (
            <Ban className="size-7" />
          ) : (
            <Clock className="size-7" />
          )}
        </span>

        <div className="flex flex-col gap-2">
          <h1 className="text-xl font-semibold">
            {suspendue
              ? "Organisation suspendue"
              : "En attente de validation"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {suspendue ? (
              <>
                L&apos;accès de « {nom} » a été suspendu. Contactez l&apos;équipe
                AgriSmart pour rétablir votre accès.
              </>
            ) : (
              <>
                « {nom} » a bien été créée. Un membre de l&apos;équipe AgriSmart
                doit valider votre organisation avant que vous puissiez accéder à
                votre tableau de bord. Vous serez averti une fois la validation
                effectuée.
              </>
            )}
          </p>
        </div>

        <Button variant="outline" onClick={handleLogout} className="mt-2">
          <LogOut className="size-4" />
          Se déconnecter
        </Button>
      </div>
    </div>
  )
}
