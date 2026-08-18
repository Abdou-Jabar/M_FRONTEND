"use client"

// Liste des alertes de l'agriculteur : toutes ses parcelles confondues.
// Messages lisibles, niveau coloré, bouton marquer lue / résolue.
// Filtres et pagination côté serveur (les alertes s'accumulent avec le temps).

import { useCallback, useEffect, useState } from "react"
import {
  AlertCircleIcon,
  BellOffIcon,
  CheckCircle2Icon,
  EyeIcon,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { ApiError } from "@/lib/api"
import {
  getMesAlertes,
  getNbAlertesNonResolues,
  marquerAlerteLue,
  messageListible,
  resoudreAlerte,
  type FiltreAlerte,
} from "@/lib/alertes/alerte-service"
import {
  NIVEAU_BADGE,
  NIVEAU_COULEUR,
  NIVEAU_LABELS,
  type Alerte,
  type NiveauAlerte,
} from "@/lib/alertes/types"
import { PaginationTable } from "@/components/table-outils"

const PAGE_SIZE = 10

function formaterDate(iso: string): string {
  return new Date(iso).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function MesAlertes() {
  const [alertes, setAlertes] = useState<Alerte[]>([])
  const [filtre, setFiltre] = useState<"toutes" | "nonLues" | "nonResolues">(
    "nonResolues",
  )
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<number | null>(null)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [totalElements, setTotalElements] = useState(0)
  const [nbNonResolues, setNbNonResolues] = useState(0)

  const chargerCompteur = useCallback(() => {
    getNbAlertesNonResolues()
      .then(setNbNonResolues)
      .catch(() => {})
  }, [])

  const charger = useCallback(
    (f: typeof filtre, p: number) => {
      const filtreApi: FiltreAlerte | undefined =
        f === "nonLues" ? "NON_LUES" : f === "nonResolues" ? "NON_RESOLUES" : undefined
      return getMesAlertes({ filtre: filtreApi, page: p, size: PAGE_SIZE })
        .then((data) => {
          setAlertes(data.content)
          setTotalPages(Math.max(1, data.totalPages))
          setTotalElements(data.totalElements)
          setPage(data.number)
          setError(null)
        })
        .catch((e) => {
          setError(
            e instanceof ApiError
              ? e.message
              : "Impossible de charger les alertes.",
          )
        })
    },
    [],
  )

  useEffect(() => {
    let actif = true
    Promise.resolve().then(() => {
      if (!actif) return
      setIsLoading(true)
      charger(filtre, page).finally(() => {
        if (actif) setIsLoading(false)
      })
    })
    return () => {
      actif = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtre, page])

  useEffect(() => {
    chargerCompteur()
  }, [chargerCompteur])

  async function handleLire(id: number) {
    setBusyId(id)
    try {
      const mise = await marquerAlerteLue(id)
      setAlertes((prev) => prev.map((a) => (a.id === id ? mise : a)))
      if (filtre === "nonLues") await charger(filtre, page)
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Action impossible.")
    } finally {
      setBusyId(null)
    }
  }

  async function handleResoudre(id: number) {
    setBusyId(id)
    try {
      const mise = await resoudreAlerte(id)
      setAlertes((prev) => prev.map((a) => (a.id === id ? mise : a)))
      toast.success("Alerte marquée comme résolue.")
      chargerCompteur()
      if (filtre !== "toutes") await charger(filtre, page)
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Action impossible.")
    } finally {
      setBusyId(null)
    }
  }

  function changerFiltre(f: "toutes" | "nonLues" | "nonResolues") {
    setFiltre(f)
    setPage(0)
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed p-8 text-sm text-muted-foreground">
        {error}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Filtres */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={filtre === "nonResolues" ? "default" : "outline"}
          size="sm"
          onClick={() => changerFiltre("nonResolues")}
        >
          Non résolues
          {nbNonResolues > 0 && (
            <Badge variant="secondary" className="ml-1">
              {nbNonResolues}
            </Badge>
          )}
        </Button>
        <Button
          variant={filtre === "nonLues" ? "default" : "outline"}
          size="sm"
          onClick={() => changerFiltre("nonLues")}
        >
          Non lues
        </Button>
        <Button
          variant={filtre === "toutes" ? "default" : "outline"}
          size="sm"
          onClick={() => changerFiltre("toutes")}
        >
          Toutes
        </Button>
      </div>

      {alertes.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-10 text-muted-foreground">
          <BellOffIcon className="size-8 opacity-40" />
          <p className="text-sm">
            {filtre === "nonResolues"
              ? "Aucune alerte à résoudre."
              : filtre === "nonLues"
                ? "Toutes vos alertes ont été lues."
                : "Aucune alerte."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {alertes.map((alerte) => (
            <CarteAlerte
              key={alerte.id}
              alerte={alerte}
              busy={busyId === alerte.id}
              onLire={handleLire}
              onResoudre={handleResoudre}
            />
          ))}
          <PaginationTable
            page={page}
            totalPages={totalPages}
            totalFiltres={totalElements}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  )
}

function CarteAlerte({
  alerte,
  busy,
  onLire,
  onResoudre,
}: {
  alerte: Alerte
  busy: boolean
  onLire: (id: number) => void
  onResoudre: (id: number) => void
}) {
  const niveau = alerte.niveau as NiveauAlerte
  const msg = messageListible(alerte.message)

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border p-4 transition-opacity",
        alerte.resolue && "opacity-60",
        !alerte.lue && "border-l-4 border-l-amber-500",
      )}
    >
      {/* En-tête */}
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <AlertCircleIcon
            className={cn("size-5 shrink-0", NIVEAU_COULEUR[niveau])}
          />
          <Badge variant={NIVEAU_BADGE[niveau]}>{NIVEAU_LABELS[niveau]}</Badge>
          <span className="text-xs text-muted-foreground">
            {formaterDate(alerte.date)}
          </span>
        </div>
        <Link
          href={`/dashboard/parcelles/${alerte.parcelleId}`}
          className="text-xs font-medium text-primary hover:underline"
        >
          {alerte.parcelleNom}
        </Link>
      </div>

      {/* Message */}
      <p className="text-sm font-medium">{msg}</p>

      {/* Actions */}
      {!alerte.resolue && (
        <div className="flex gap-2">
          {!alerte.lue && (
            <Button
              variant="outline"
              size="sm"
              disabled={busy}
              onClick={() => onLire(alerte.id)}
            >
              <EyeIcon className="size-4" />
              Marquer lue
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={() => onResoudre(alerte.id)}
          >
            <CheckCircle2Icon className="size-4" />
            Résoudre
          </Button>
        </div>
      )}
      {alerte.resolue && (
        <p className="text-xs text-muted-foreground">
          Alerte resolue
        </p>
      )}
    </div>
  )
}
