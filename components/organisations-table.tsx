"use client"

// Tableau des organisations (espace équipe AgriSmart).
// Permet de valider, suspendre ou réactiver une organisation.

import { useEffect, useState } from "react"
import { CheckCircle2, MoreHorizontal, PauseCircle, PlayCircle } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ApiError } from "@/lib/api"
import {
  getOrganisations,
  reactiverOrganisation,
  suspendreOrganisation,
  validerOrganisation,
} from "@/lib/organisations/organisation-service"
import {
  STATUT_ORGANISATION_BADGE,
  STATUT_ORGANISATION_LABELS,
  type Organisation,
} from "@/lib/organisations/types"

function formaterDate(valeur: string): string {
  const date = new Date(valeur)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleDateString("fr-FR", { dateStyle: "medium" })
}

export function OrganisationsTable() {
  const [organisations, setOrganisations] = useState<Organisation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let actif = true
    getOrganisations()
      .then((data) => {
        if (!actif) return
        setOrganisations(data)
        setError(null)
      })
      .catch((e) => {
        if (!actif) return
        setError(
          e instanceof ApiError
            ? e.message
            : "Impossible de charger les organisations.",
        )
      })
      .finally(() => {
        if (actif) setIsLoading(false)
      })
    return () => {
      actif = false
    }
  }, [])

  function recharger() {
    setIsLoading(true)
    setError(null)
    getOrganisations()
      .then((data) => {
        setOrganisations(data)
        setError(null)
      })
      .catch((e) => {
        setError(
          e instanceof ApiError
            ? e.message
            : "Impossible de charger les organisations.",
        )
      })
      .finally(() => setIsLoading(false))
  }

  async function appliquer(
    action: (id: number) => Promise<Organisation>,
    org: Organisation,
    messageSucces: string,
  ) {
    try {
      const maj = await action(org.id)
      setOrganisations((prev) => prev.map((o) => (o.id === maj.id ? maj : o)))
      toast.success(messageSucces)
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Opération impossible.")
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-8 text-sm text-muted-foreground">
        <p>{error}</p>
        <Button variant="outline" size="sm" onClick={recharger}>
          Réessayer
        </Button>
      </div>
    )
  }

  if (organisations.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed p-8 text-sm text-muted-foreground">
        Aucune organisation pour le moment.
      </div>
    )
  }

  return (
    <div className="rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Organisation</TableHead>
            <TableHead>Administrateur</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Créée le</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {organisations.map((org) => (
            <TableRow key={org.id}>
              <TableCell className="font-medium">{org.nom}</TableCell>
              <TableCell>
                {org.adminNomComplet ?? "—"}
                {org.adminEmail ? (
                  <span className="block text-xs font-normal text-muted-foreground">
                    {org.adminEmail}
                  </span>
                ) : null}
              </TableCell>
              <TableCell>
                <Badge variant={STATUT_ORGANISATION_BADGE[org.statut]}>
                  {STATUT_ORGANISATION_LABELS[org.statut]}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formaterDate(org.dateCreation)}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      aria-label={`Actions pour ${org.nom}`}
                    >
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {org.statut !== "ACTIVE" && (
                      <DropdownMenuItem
                        onSelect={(e) => {
                          e.preventDefault()
                          const action =
                            org.statut === "EN_ATTENTE"
                              ? validerOrganisation
                              : reactiverOrganisation
                          appliquer(
                            action,
                            org,
                            `Organisation « ${org.nom} » activée.`,
                          )
                        }}
                      >
                        {org.statut === "EN_ATTENTE" ? (
                          <>
                            <CheckCircle2 className="size-4" />
                            Valider
                          </>
                        ) : (
                          <>
                            <PlayCircle className="size-4" />
                            Réactiver
                          </>
                        )}
                      </DropdownMenuItem>
                    )}
                    {org.statut === "ACTIVE" && (
                      <DropdownMenuItem
                        variant="destructive"
                        onSelect={(e) => {
                          e.preventDefault()
                          appliquer(
                            suspendreOrganisation,
                            org,
                            `Organisation « ${org.nom} » suspendue.`,
                          )
                        }}
                      >
                        <PauseCircle className="size-4" />
                        Suspendre
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
