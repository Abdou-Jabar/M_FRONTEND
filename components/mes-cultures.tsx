"use client"

// Liste des cultures de l'agriculteur : toutes ses parcelles confondues.
// Affiche le type de culture, l'état, la parcelle associée et la durée.

import { useEffect, useState } from "react"
import Link from "next/link"
import { PlusIcon, SproutIcon } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { ApiError } from "@/lib/api"
import {
  abandonnerCulture,
  getMesCultures,
  recolterCulture,
} from "@/lib/cultures/culture-service"
import {
  SAISON_LABELS,
  STATUT_CULTURE_LABELS,
  type Culture,
  type StatutCulture,
} from "@/lib/cultures/types"
import { PaginationTable } from "@/components/table-outils"

const STATUT_BADGE: Record<
  StatutCulture,
  "default" | "secondary" | "outline" | "destructive"
> = {
  PLANIFIEE:  "outline",
  EN_COURS:   "default",
  RECOLTEE:   "secondary",
  ABANDONNEE: "destructive",
}

const STATUT_COULEUR: Record<StatutCulture, string> = {
  PLANIFIEE:  "border-l-slate-400",
  EN_COURS:   "border-l-emerald-500",
  RECOLTEE:   "border-l-blue-400",
  ABANDONNEE: "border-l-red-400",
}

function formaterDate(iso: string | null): string {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

function duree(debut: string, fin: string | null): string {
  const start = new Date(debut)
  const end = fin ? new Date(fin) : new Date()
  const jours = Math.floor((end.getTime() - start.getTime()) / 86400000)
  if (jours < 1) return "Démarré aujourd'hui"
  if (jours === 1) return "1 jour"
  if (jours < 30) return `${jours} jours`
  const mois = Math.floor(jours / 30)
  return mois === 1 ? "1 mois" : `${mois} mois`
}

export function MesCultures() {
  const [cultures, setCultures] = useState<Culture[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<number | null>(null)
  const [filtre, setFiltre] = useState<StatutCulture | "TOUTES">("EN_COURS")
  const [page, setPage] = useState(0)

  useEffect(() => {
    let actif = true
    getMesCultures()
      .then((data) => {
        if (!actif) return
        setCultures(data)
        setError(null)
      })
      .catch((e) => {
        if (!actif) return
        setError(
          e instanceof ApiError
            ? e.message
            : "Impossible de charger vos cultures.",
        )
      })
      .finally(() => {
        if (actif) setIsLoading(false)
      })
    return () => {
      actif = false
    }
  }, [])

  async function handleRecolter(id: number) {
    setBusyId(id)
    try {
      const mise = await recolterCulture(id)
      setCultures((prev) => prev.map((c) => (c.id === id ? mise : c)))
      toast.success("Culture marquée comme récoltée.")
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Action impossible.")
    } finally {
      setBusyId(null)
    }
  }

  async function handleAbandonner(id: number) {
    setBusyId(id)
    try {
      await abandonnerCulture(id)
      setCultures((prev) => prev.filter((c) => c.id !== id))
      toast.success("Culture abandonnée.")
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Action impossible.")
    } finally {
      setBusyId(null)
    }
  }

  const affichees =
    filtre === "TOUTES"
      ? cultures
      : cultures.filter((c) => c.statut === filtre)

  const PAGE_SIZE = 10
  const totalPages = Math.max(1, Math.ceil(affichees.length / PAGE_SIZE))
  const pageEffective = Math.min(page, totalPages - 1)
  const pageCultures = affichees.slice(
    pageEffective * PAGE_SIZE,
    (pageEffective + 1) * PAGE_SIZE,
  )

  function changerFiltre(f: StatutCulture | "TOUTES") {
    setFiltre(f)
    setPage(0)
  }

  const nbEnCours = cultures.filter((c) => c.statut === "EN_COURS").length

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full" />
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
      {/* Filtres + action */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filtre === "EN_COURS" ? "default" : "outline"}
            size="sm"
            onClick={() => changerFiltre("EN_COURS")}
          >
            En cours
            {nbEnCours > 0 && (
              <Badge variant="secondary" className="ml-1">
                {nbEnCours}
              </Badge>
            )}
          </Button>
          <Button
            variant={filtre === "RECOLTEE" ? "default" : "outline"}
            size="sm"
            onClick={() => changerFiltre("RECOLTEE")}
          >
            Récoltées
          </Button>
          <Button
            variant={filtre === "TOUTES" ? "default" : "outline"}
            size="sm"
            onClick={() => changerFiltre("TOUTES")}
          >
            Toutes ({cultures.length})
          </Button>
        </div>
        <Button size="sm" asChild>
          <Link href="/dashboard/cultures/nouvelle">
            <PlusIcon className="size-4" />
            Nouvelle culture
          </Link>
        </Button>
      </div>

      {affichees.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-10 text-muted-foreground">
          <SproutIcon className="size-8 opacity-40" />
          <p className="text-sm">Aucune culture {filtre === "EN_COURS" ? "en cours" : filtre === "RECOLTEE" ? "récoltée" : ""}.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {pageCultures.map((c) => (
            <CarteCulture
              key={c.id}
              culture={c}
              busy={busyId === c.id}
              onRecolter={handleRecolter}
              onAbandonner={handleAbandonner}
            />
          ))}
          <PaginationTable
            page={pageEffective}
            totalPages={totalPages}
            totalFiltres={affichees.length}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  )
}

function CarteCulture({
  culture,
  busy,
  onRecolter,
  onAbandonner,
}: {
  culture: Culture
  busy: boolean
  onRecolter: (id: number) => void
  onAbandonner: (id: number) => void
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-l-4 p-4",
        STATUT_COULEUR[culture.statut],
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <SproutIcon className="size-4 text-emerald-600" />
            <span className="font-semibold">
              {culture.typeCultureNom}
              {culture.typeCultureVariete
                ? ` — ${culture.typeCultureVariete}`
                : ""}
            </span>
          </div>
          <Link
            href={`/dashboard/parcelles/${culture.parcelleId}`}
            className="text-sm text-primary hover:underline"
          >
            {culture.parcelleNom}
          </Link>
        </div>
        <Badge variant={STATUT_BADGE[culture.statut]}>
          {STATUT_CULTURE_LABELS[culture.statut]}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground sm:grid-cols-3">
        <div>
          <span className="block text-xs uppercase tracking-wide">Saison</span>
          <span className="font-medium text-foreground">
            {SAISON_LABELS[culture.saison as keyof typeof SAISON_LABELS] ??
              culture.saison}
          </span>
        </div>
        <div>
          <span className="block text-xs uppercase tracking-wide">
            Démarrée
          </span>
          <span className="font-medium text-foreground">
            {formaterDate(culture.dateDebut)}
          </span>
        </div>
        <div>
          <span className="block text-xs uppercase tracking-wide">Durée</span>
          <span className="font-medium text-foreground">
            {duree(culture.dateDebut, culture.dateFin)}
          </span>
        </div>
      </div>

      {culture.statut === "EN_COURS" && (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/parcelles/${culture.parcelleId}`}>
              Voir la parcelle
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" disabled={busy}>
                Marquer récoltée
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmer la récolte ?</AlertDialogTitle>
                <AlertDialogDescription>
                  La culture de{" "}
                  <strong>{culture.typeCultureNom}</strong> sur la parcelle{" "}
                  <strong>{culture.parcelleNom}</strong> sera marquée comme
                  récoltée. La date de fin sera enregistrée.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={() => onRecolter(culture.id)}>
                  Confirmer la récolte
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive"
                disabled={busy}
              >
                Abandonner
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Abandonner cette culture ?</AlertDialogTitle>
                <AlertDialogDescription>
                  La culture de{" "}
                  <strong>{culture.typeCultureNom}</strong> sur la parcelle{" "}
                  <strong>{culture.parcelleNom}</strong> sera retirée du
                  suivi. Les mesures et alertes déjà enregistrées sont
                  conservées.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={() => onAbandonner(culture.id)}>
                  Abandonner la culture
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </div>
  )
}
