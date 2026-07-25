"use client"

// Vue agriculteur du détail d'une parcelle.
// Affiche : culture active, alertes non résolues, graphes des mesures.
// Aucun concept technique (dispositif, MAC…) n'est exposé.

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  AlertCircleIcon,
  ArrowLeftIcon,
  BellOffIcon,
  CheckCircle2Icon,
  EyeIcon,
  SproutIcon,
} from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ParcelleStatistiques } from "@/components/parcelle-statistiques"
import { cn } from "@/lib/utils"
import { ApiError } from "@/lib/api"
import {
  getTableauDeBordParcelle,
  type TableauDeBordParcelle,
} from "@/lib/parcelles/tableau-de-bord"
import {
  ENVIRONNEMENT_LABELS,
  TYPE_SOL_LABELS,
} from "@/lib/parcelles/types"
import {
  NIVEAU_BADGE,
  NIVEAU_COULEUR,
  NIVEAU_LABELS,
  type NiveauAlerte,
} from "@/lib/alertes/types"
import { SAISON_LABELS } from "@/lib/cultures/types"
import { MeteoWidget } from "@/components/meteo-widget"
import { marquerAlerteLue, resoudreAlerte } from "@/lib/alertes/alerte-service"

function formaterDate(iso: string | null): string {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

export function ParcelleAgriculteur({ id }: { id: number }) {
  const [tableau, setTableau] = useState<TableauDeBordParcelle | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<number | null>(null)

  useEffect(() => {
    let actif = true
    getTableauDeBordParcelle(id)
      .then((data) => {
        if (!actif) return
        setTableau(data)
        setError(null)
      })
      .catch((e) => {
        if (!actif) return
        setError(
          e instanceof ApiError
            ? e.message
            : "Impossible de charger cette parcelle.",
        )
      })
      .finally(() => {
        if (actif) setIsLoading(false)
      })
    return () => {
      actif = false
    }
  }, [id])

  async function handleLire(alerteId: number) {
    setBusyId(alerteId)
    try {
      await marquerAlerteLue(alerteId)
      setTableau((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          alertes: prev.alertes.map((a) =>
            a.id === alerteId ? { ...a, lue: true } : a,
          ),
        }
      })
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Action impossible.")
    } finally {
      setBusyId(null)
    }
  }

  async function handleResoudre(alerteId: number) {
    setBusyId(alerteId)
    try {
      await resoudreAlerte(alerteId)
      setTableau((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          alertes: prev.alertes.filter((a) => a.id !== alerteId),
          totalAlertesNonResolues: Math.max(
            0,
            prev.totalAlertesNonResolues - 1,
          ),
        }
      })
      toast.success("Alerte résolue.")
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Action impossible.")
    } finally {
      setBusyId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-4 md:p-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (error || !tableau) {
    return (
      <div className="flex flex-col gap-4 p-4 md:p-6">
        <Button variant="ghost" size="sm" asChild className="-ml-2 w-fit">
          <Link href="/dashboard/parcelles">
            <ArrowLeftIcon className="size-4" />
            Retour aux parcelles
          </Link>
        </Button>
        <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed p-8 text-sm text-muted-foreground">
          {error ?? "Parcelle introuvable."}
        </div>
      </div>
    )
  }

  const { culture } = tableau

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      {/* Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button variant="ghost" size="sm" asChild className="-ml-2 w-fit">
          <Link href="/dashboard/parcelles">
            <ArrowLeftIcon className="size-4" />
            Mes parcelles
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/dashboard/parcelles/${id}/modifier`}>
            Modifier la parcelle
          </Link>
        </Button>
      </div>

      {/* En-tête parcelle */}
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-semibold tracking-tight">
          {tableau.parcelleNom}
        </h2>
        {tableau.parcelleDescription && (
          <p className="text-sm text-muted-foreground">
            {tableau.parcelleDescription}
          </p>
        )}
        <div className="mt-1 flex flex-wrap gap-2">
          <Badge variant="outline">
            {ENVIRONNEMENT_LABELS[tableau.environnement]}
          </Badge>
          <Badge variant="outline">
            Sol : {TYPE_SOL_LABELS[tableau.typeSol]}
          </Badge>
          <Badge variant="outline">
            {tableau.superficie?.toLocaleString("fr-FR")} m²
          </Badge>
        </div>
      </div>

      {/* Météo en temps réel — uniquement pour les parcelles en plein air */}
      {tableau.environnement === "PLEIN_AIR" &&
        tableau.latitude != null &&
        tableau.longitude != null && (
          <MeteoWidget
            latitude={tableau.latitude}
            longitude={tableau.longitude}
            parcelleNom={tableau.parcelleNom}
          />
        )}

      {/* Culture active */}
      <Card
        className={cn(
          "border-l-4",
          culture ? "border-l-emerald-500" : "border-l-slate-300",
        )}
      >
        <CardHeader>
          <CardDescription>Culture en cours</CardDescription>
          <CardTitle className="flex items-center gap-2 text-lg">
            <SproutIcon className="size-5 text-emerald-600" />
            {culture
              ? `${culture.typeCultureNom}${culture.typeCultureVariete ? ` — ${culture.typeCultureVariete}` : ""}`
              : "Aucune culture en cours"}
          </CardTitle>
        </CardHeader>
        {culture && (
          <CardContent className="flex flex-wrap gap-6 text-sm">
            <div>
              <span className="block text-xs text-muted-foreground">
                Saison
              </span>
              <span className="font-medium">
                {SAISON_LABELS[culture.saison as keyof typeof SAISON_LABELS] ??
                  culture.saison}
              </span>
            </div>
            <div>
              <span className="block text-xs text-muted-foreground">
                Démarrée le
              </span>
              <span className="font-medium">
                {formaterDate(culture.dateDebut)}
              </span>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Alertes non résolues */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold tracking-tight">Alertes</h3>
          {tableau.totalAlertesNonResolues > 0 && (
            <Badge variant="destructive">
              {tableau.totalAlertesNonResolues} non résolue
              {tableau.totalAlertesNonResolues > 1 ? "s" : ""}
            </Badge>
          )}
        </div>

        {tableau.alertes.length === 0 ? (
          <div className="flex items-center justify-center gap-2 rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
            <BellOffIcon className="size-5 opacity-40" />
            Aucune alerte active sur cette parcelle.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {tableau.alertes.map((alerte) => {
              const niveau = alerte.niveau as NiveauAlerte
              return (
                <div
                  key={alerte.id}
                  className="flex flex-wrap items-start justify-between gap-3 rounded-xl border p-4"
                >
                  <div className="flex items-start gap-3">
                    <AlertCircleIcon
                      className={cn(
                        "mt-0.5 size-5 shrink-0",
                        NIVEAU_COULEUR[niveau],
                      )}
                    />
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={NIVEAU_BADGE[niveau]}>
                          {NIVEAU_LABELS[niveau]}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {alerte.facteur}
                          {alerte.valeurMesuree != null
                            ? ` — valeur : ${alerte.valeurMesuree}`
                            : ""}
                        </span>
                      </div>
                      <p className="text-sm">{alerte.messageListible}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!alerte.lue && (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={busyId === alerte.id}
                        onClick={() => handleLire(alerte.id)}
                      >
                        <EyeIcon className="size-4" />
                        Lue
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={busyId === alerte.id}
                      onClick={() => handleResoudre(alerte.id)}
                    >
                      <CheckCircle2Icon className="size-4" />
                      Résoudre
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Graphes des mesures (composant existant réutilisé) */}
      <div className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold tracking-tight">
          Mesures des capteurs
        </h3>
        <p className="text-sm text-muted-foreground">
          Évolution des conditions de votre parcelle sur la période
          sélectionnée.
        </p>
        <ParcelleStatistiques id={id} />
      </div>
    </div>
  )
}
