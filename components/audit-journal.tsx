"use client"

// Journal d'audit (superviseur) : traces des actions sensibles, regroupées
// par organisation. Un sélecteur permet de filtrer sur une organisation
// précise ; la vue « Toutes » groupe les traces par organisation.

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Building2Icon, RefreshCwIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  getJournalAudit,
  getJournalAuditOrganisation,
  type AuditLog,
} from "@/lib/audit/audit-service"
import { getOrganisations } from "@/lib/organisations/organisation-service"
import type { Organisation } from "@/lib/organisations/types"

function formaterDate(valeur: string): string {
  const date = new Date(valeur)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleString("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  })
}

// Regroupe les traces par organisation (nom d'affichage).
function grouperParOrganisation(
  traces: AuditLog[],
): { organisation: string; traces: AuditLog[] }[] {
  const groupes = new Map<string, AuditLog[]>()
  for (const trace of traces) {
    const cle = trace.organisationNom ?? "Équipe AgriSmart"
    const liste = groupes.get(cle) ?? []
    liste.push(trace)
    groupes.set(cle, liste)
  }
  return [...groupes.entries()].map(([organisation, listeTraces]) => ({
    organisation,
    traces: listeTraces,
  }))
}

function TableTraces({ traces }: { traces: AuditLog[] }) {
  return (
    <div className="rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-36">Date</TableHead>
            <TableHead className="w-48">Action</TableHead>
            <TableHead>Détails</TableHead>
            <TableHead className="w-48">Auteur</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {traces.map((trace) => (
            <TableRow key={trace.id}>
              <TableCell className="text-muted-foreground">
                {formaterDate(trace.date)}
              </TableCell>
              <TableCell>
                <Badge variant="outline">{trace.action}</Badge>
              </TableCell>
              <TableCell className="max-w-md truncate" title={trace.details ?? ""}>
                {trace.details ?? "—"}
              </TableCell>
              <TableCell>
                <span className="flex flex-col">
                  <span>{trace.utilisateurNom ?? "—"}</span>
                  <span className="text-xs text-muted-foreground">
                    {trace.utilisateurRole ?? ""}
                  </span>
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export function AuditJournal() {
  const [organisations, setOrganisations] = useState<Organisation[]>([])
  const [filtre, setFiltre] = useState<string>("toutes")
  const [traces, setTraces] = useState<AuditLog[]>([])
  const [totalElements, setTotalElements] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // Jeton incrémenté pour forcer un rechargement (bouton « Actualiser »).
  const [rechargement, setRechargement] = useState(0)

  // Liste des organisations pour le sélecteur.
  useEffect(() => {
    let actif = true
    getOrganisations()
      .then((data) => {
        if (actif) setOrganisations(data)
      })
      .catch(() => {
        // Non bloquant : le filtre « Toutes » reste utilisable.
      })
    return () => {
      actif = false
    }
  }, [])

  // Charge le journal selon le filtre.
  useEffect(() => {
    let actif = true
    const requete =
      filtre === "toutes"
        ? getJournalAudit(0, 100)
        : getJournalAuditOrganisation(Number(filtre), 0, 100)
    requete
      .then((page) => {
        if (!actif) return
        setTraces(page.content)
        setTotalElements(page.totalElements)
        setError(null)
      })
      .catch((e) => {
        if (!actif) return
        setError(
          e instanceof ApiError
            ? e.message
            : "Impossible de charger le journal d'audit.",
        )
      })
      .finally(() => {
        if (actif) setIsLoading(false)
      })
    return () => {
      actif = false
    }
  }, [filtre, rechargement])

  function actualiser() {
    setIsLoading(true)
    setRechargement((n) => n + 1)
    toast.info("Journal actualisé.")
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-10 text-sm text-muted-foreground">
        <p>{error}</p>
        <Button variant="outline" size="sm" onClick={actualiser}>
          <RefreshCwIcon className="size-4" />
          Réessayer
        </Button>
      </div>
    )
  }

  const groupes = grouperParOrganisation(traces)

  return (
    <div className="flex flex-col gap-4">
      {/* Filtre organisation + total + actualiser */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Select value={filtre} onValueChange={setFiltre}>
          <SelectTrigger className="w-72">
            <SelectValue placeholder="Organisation" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="toutes">Toutes les organisations</SelectItem>
            {organisations.map((org) => (
              <SelectItem key={org.id} value={String(org.id)}>
                {org.nom}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {totalElements} trace(s)
          </span>
          <Button variant="outline" size="sm" onClick={actualiser}>
            <RefreshCwIcon className="size-4" />
            Actualiser
          </Button>
        </div>
      </div>

      {traces.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-10 text-sm text-muted-foreground">
          <p>Aucune trace d&apos;audit pour le moment.</p>
        </div>
      ) : filtre === "toutes" ? (
        // Vue groupée : une section par organisation.
        <div className="flex flex-col gap-6">
          {groupes.map(({ organisation, traces: listeTraces }) => (
            <section key={organisation} className="flex flex-col gap-2">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <Building2Icon className="size-4 text-muted-foreground" />
                {organisation}
                <Badge variant="secondary">{listeTraces.length}</Badge>
              </h3>
              <TableTraces traces={listeTraces} />
            </section>
          ))}
        </div>
      ) : (
        <TableTraces traces={traces} />
      )}
    </div>
  )
}
