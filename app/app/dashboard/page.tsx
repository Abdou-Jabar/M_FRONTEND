"use client"

// Tableau de bord client (app.agrismart.com/dashboard) : cartes de synthèse et
// graphe des mesures, alimentés par les données réelles du périmètre de
// l'utilisateur (GET /api/stats/dashboard-client).

import { useEffect, useState } from "react"

import { ClientSectionCards } from "@/components/client-section-cards"
import { ClientApercuCapteurs } from "@/components/client-apercu-capteurs"
import { ApiError } from "@/lib/api"
import { getDashboardClient } from "@/lib/stats/stats-service"
import type { DashboardClient } from "@/lib/stats/types"

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardClient | null>(null)
  const [loading, setLoading] = useState(true)
  const [erreur, setErreur] = useState<string | null>(null)

  useEffect(() => {
    let actif = true
    getDashboardClient()
      .then((data) => {
        if (actif) setStats(data)
      })
      .catch((e) => {
        if (actif)
          setErreur(
            e instanceof ApiError
              ? e.message
              : "Impossible de charger les statistiques.",
          )
      })
      .finally(() => {
        if (actif) setLoading(false)
      })
    return () => {
      actif = false
    }
  }, [])

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          {loading ? (
            <p className="px-4 text-sm text-muted-foreground lg:px-6">
              Chargement des statistiques…
            </p>
          ) : erreur ? (
            <p className="px-4 text-sm text-destructive lg:px-6">{erreur}</p>
          ) : stats ? (
            <>
              <ClientSectionCards stats={stats} />
              <div className="px-4 lg:px-6">
                <ClientApercuCapteurs apercu={stats.apercuCapteurs} />
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}
