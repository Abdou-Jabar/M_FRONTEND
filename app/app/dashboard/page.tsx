"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { AlertCircleIcon, ArrowRightIcon, SproutIcon } from "lucide-react"

import { AgriculteurSectionCards } from "@/components/agriculteur-section-cards"
import { ClientApercuCapteurs } from "@/components/client-apercu-capteurs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ApiError } from "@/lib/api"
import { getDashboardClient } from "@/lib/stats/stats-service"
import { getMesAlertes, messageListible } from "@/lib/alertes/alerte-service"
import { getMesCultures } from "@/lib/cultures/culture-service"
import type { DashboardClient } from "@/lib/stats/types"
import type { Alerte } from "@/lib/alertes/types"
import type { Culture } from "@/lib/cultures/types"
import {
  NIVEAU_BADGE,
  NIVEAU_COULEUR,
  NIVEAU_LABELS,
} from "@/lib/alertes/types"
import { useAuth } from "@/lib/auth/use-auth"

export default function DashboardPage() {
  const { isLoading: authLoading } = useAuth()

  const [stats, setStats] = useState<DashboardClient | null>(null)
  const [alertes, setAlertes] = useState<Alerte[]>([])
  const [cultures, setCultures] = useState<Culture[]>([])
  const [loading, setLoading] = useState(true)
  const [erreur, setErreur] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) return
    let actif = true

    Promise.all([getDashboardClient(), getMesAlertes(), getMesCultures()])
      .then(([s, a, c]) => {
        if (!actif) return
        setStats(s)
        const ordre: Record<string, number> = {
          URGENCE: 0,
          CRITIQUE: 1,
          ATTENTION: 2,
          INFO: 3,
        }
        setAlertes(
          a
            .filter((x) => !x.resolue)
            .sort((x, y) => (ordre[x.niveau] ?? 3) - (ordre[y.niveau] ?? 3))
            .slice(0, 3),
        )
        setCultures(c.filter((x) => x.statut === "EN_COURS"))
        setErreur(null)
      })
      .catch((e) => {
        if (!actif) return
        setErreur(
          e instanceof ApiError
            ? e.message
            : "Impossible de charger le tableau de bord.",
        )
      })
      .finally(() => {
        if (actif) setLoading(false)
      })
    return () => {
      actif = false
    }
  }, [authLoading])

  if (loading || authLoading) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </div>
    )
  }

  if (erreur) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-sm text-destructive">
        {erreur}
      </div>
    )
  }

  return (
    <div className="@container/main flex flex-1 flex-col gap-6 py-4 md:py-6">
      {/* Cartes de synthèse */}
      {stats && <AgriculteurSectionCards stats={stats} />}

      <div className="grid gap-6 px-4 lg:px-6 md:grid-cols-2">
        {/* Alertes prioritaires */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold tracking-tight">Alertes à traiter</h3>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/alertes">
                Voir toutes
                <ArrowRightIcon className="size-4" />
              </Link>
            </Button>
          </div>

          {alertes.length === 0 ? (
            <div className="flex items-center justify-center gap-2 rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
              Aucune alerte active — tout est au vert 🌱
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {alertes.map((a) => (
                <Link
                  key={a.id}
                  href={`/dashboard/parcelles/${a.parcelleId}`}
                  className="flex items-start gap-3 rounded-xl border p-3 transition-colors hover:bg-muted/50"
                >
                  <AlertCircleIcon
                    className={`mt-0.5 size-5 shrink-0 ${NIVEAU_COULEUR[a.niveau]}`}
                  />
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={NIVEAU_BADGE[a.niveau]}
                        className="text-xs"
                      >
                        {NIVEAU_LABELS[a.niveau]}
                      </Badge>
                      <span className="truncate text-xs text-muted-foreground">
                        {a.parcelleNom}
                      </span>
                    </div>
                    <p className="truncate text-sm">
                      {messageListible(a.message)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Cultures en cours */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold tracking-tight">Cultures en cours</h3>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/cultures">
                Voir toutes
                <ArrowRightIcon className="size-4" />
              </Link>
            </Button>
          </div>

          {cultures.length === 0 ? (
            <div className="flex items-center justify-center gap-2 rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
              Aucune culture en cours.
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {cultures.slice(0, 3).map((c) => (
                <Link
                  key={c.id}
                  href={`/dashboard/parcelles/${c.parcelleId}`}
                  className="flex items-center gap-3 rounded-xl border p-3 transition-colors hover:bg-muted/50"
                >
                  <SproutIcon className="size-5 shrink-0 text-emerald-600" />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate font-medium">
                      {c.typeCultureNom}
                      {c.typeCultureVariete
                        ? ` — ${c.typeCultureVariete}`
                        : ""}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {c.parcelleNom}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Conditions récentes des parcelles */}
      {stats && stats.apercuCapteurs.length > 0 && (
        <div className="flex flex-col gap-3 px-4 lg:px-6">
          <h3 className="font-semibold tracking-tight">
            Conditions récentes de vos parcelles
          </h3>
          <ClientApercuCapteurs
            apercu={stats.apercuCapteurs}
            lienVersParcelle={true}
          />
        </div>
      )}
    </div>
  )
}
