"use client"

// Liste des alertes de l'agriculteur : toutes ses parcelles confondues.
// Messages lisibles, niveau coloré, bouton marquer lue / résolue.

import { useEffect, useState } from "react"
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
  marquerAlerteLue,
  messageListible,
  resoudreAlerte,
} from "@/lib/alertes/alerte-service"
import {
  NIVEAU_BADGE,
  NIVEAU_COULEUR,
  NIVEAU_LABELS,
  type Alerte,
  type NiveauAlerte,
} from "@/lib/alertes/types"

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

  useEffect(() => {
    let actif = true
    getMesAlertes()
      .then((data) => {
        if (!actif) return
        setAlertes(data)
        setError(null)
      })
      .catch((e) => {
        if (!actif) return
        setError(
          e instanceof ApiError ? e.message : "Impossible de charger les alertes.",
        )
      })
      .finally(() => {
        if (actif) setIsLoading(false)
      })
    return () => {
      actif = false
    }
  }, [])

  async function handleLire(id: number) {
    setBusyId(id)
    try {
      const mise = await marquerAlerteLue(id)
      setAlertes((prev) => prev.map((a) => (a.id === id ? mise : a)))
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
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Action impossible.")
    } finally {
      setBusyId(null)
    }
  }

  const affichees = alertes.filter((a) => {
    if (filtre === "nonLues") return !a.lue
    if (filtre === "nonResolues") return !a.resolue
    return true
  })

  const nbNonResolues = alertes.filter((a) => !a.resolue).length
  const nbNonLues = alertes.filter((a) => !a.lue).length

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
          onClick={() => setFiltre("nonResolues")}
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
          onClick={() => setFiltre("nonLues")}
        >
          Non lues
          {nbNonLues > 0 && (
            <Badge variant="secondary" className="ml-1">
              {nbNonLues}
            </Badge>
          )}
        </Button>
        <Button
          variant={filtre === "toutes" ? "default" : "outline"}
          size="sm"
          onClick={() => setFiltre("toutes")}
        >
          Toutes ({alertes.length})
        </Button>
      </div>

      {affichees.length === 0 ? (
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
          {affichees.map((alerte) => (
            <CarteAlerte
              key={alerte.id}
              alerte={alerte}
              busy={busyId === alerte.id}
              onLire={handleLire}
              onResoudre={handleResoudre}
            />
          ))}
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
