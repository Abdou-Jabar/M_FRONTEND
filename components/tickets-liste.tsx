"use client"

// Composant liste des tickets avec filtres par statut et pagination.
// Utilisé dans la page /dashboard/tickets (app et admin).

import { useEffect, useState } from "react"
import Link from "next/link"
import { Plus, RefreshCwIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { TicketCard } from "@/components/ticket-card"
import { ApiError } from "@/lib/api"
import { getTickets } from "@/lib/tickets/ticket-service"
import {
  STATUT_FILTRE_OPTIONS,
  type StatutTicket,
  type TicketResponse,
} from "@/lib/tickets/types"
import { useAuth } from "@/lib/auth/use-auth"

const PAGE_SIZE = 10

// Rôles qui peuvent créer un ticket.
const ROLES_CREATEURS = ["ADMIN", "AGRICULTEUR"]

export function TicketsListe() {
  const { user } = useAuth()

  const [tickets, setTickets] = useState<TicketResponse[]>([])
  const [filtreStatut, setFiltreStatut] = useState<StatutTicket | "TOUS">("TOUS")
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const statut = filtreStatut === "TOUS" ? null : filtreStatut

  function charger(p: number, s: StatutTicket | null) {
    let actif = true

    Promise.resolve().then(() => {
      if (!actif) return
      setIsLoading(true)
      setError(null)
      getTickets(s, p, PAGE_SIZE)
        .then((data) => {
          if (!actif) return
          setTickets(data.content)
          setTotalPages(data.totalPages)
          setTotalElements(data.totalElements)
          setPage(data.number)
        })
        .catch((e) => {
          if (!actif) return
          setError(
            e instanceof ApiError
              ? e.message
              : "Impossible de charger les tickets.",
          )
        })
        .finally(() => {
          if (actif) setIsLoading(false)
        })
    })

    return () => { actif = false }
  }

  useEffect(() => {
    return charger(0, statut)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtreStatut])

  function handleFiltreChange(valeur: StatutTicket | "TOUS") {
    setFiltreStatut(valeur)
    setPage(0)
  }

  function handlePage(nouvellePage: number) {
    charger(nouvellePage, statut)
  }

  const peutCreer = user && ROLES_CREATEURS.includes(user.role)

  return (
    <div className="flex flex-col gap-4">

      {/* En-tête : filtres + bouton créer */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Filtres statut */}
        <div className="flex flex-wrap gap-2">
          {STATUT_FILTRE_OPTIONS.map((opt) => (
            <Button
              key={opt.value}
              variant={filtreStatut === opt.value ? "default" : "outline"}
              size="sm"
              onClick={() => handleFiltreChange(opt.value)}
            >
              {opt.label}
              {opt.value === "TOUS" && totalElements > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {totalElements}
                </Badge>
              )}
            </Button>
          ))}
        </div>

        {peutCreer && (
          <Button asChild size="sm">
            <Link href="/dashboard/tickets/nouveau">
              <Plus className="size-4" />
              Nouveau ticket
            </Link>
          </Button>
        )}
      </div>

      {/* Corps */}
      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-10 text-sm text-muted-foreground">
          <p>{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => charger(page, statut)}
          >
            <RefreshCwIcon className="size-4" />
            Réessayer
          </Button>
        </div>
      ) : tickets.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-10 text-sm text-muted-foreground">
          <p>
            {filtreStatut === "TOUS"
              ? "Aucun ticket pour le moment."
              : `Aucun ticket avec le statut « ${STATUT_FILTRE_OPTIONS.find((o) => o.value === filtreStatut)?.label} ».`}
          </p>
          {peutCreer && filtreStatut === "TOUS" && (
            <Button asChild size="sm" variant="outline">
              <Link href="/dashboard/tickets/nouveau">
                <Plus className="size-4" />
                Ouvrir un ticket
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {tickets.map((t) => (
            <TicketCard
              key={t.id}
              ticket={t}
              href={`/dashboard/tickets/${t.id}`}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && !error && totalPages > 1 && (
        <div className="flex items-center justify-between gap-4 pt-2 text-sm text-muted-foreground">
          <span>
            Page {page + 1} / {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePage(page - 1)}
              disabled={page === 0}
            >
              Précédent
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePage(page + 1)}
              disabled={page >= totalPages - 1}
            >
              Suivant
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
