"use client"

// Accueil du dashboard équipe : cartes de synthèse + graphe d'inscriptions,
// alimentés par les données réelles de la plateforme (GET /api/stats/dashboard).

import { useEffect, useState } from "react"

import { AdminSectionCards } from "@/components/admin-section-cards"
import { AdminChartInscriptions } from "@/components/admin-chart-inscriptions"
import { ApiError } from "@/lib/api"
import { getDashboardStats } from "@/lib/stats/stats-service"
import type { DashboardStats } from "@/lib/stats/types"

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [erreur, setErreur] = useState<string | null>(null)

  useEffect(() => {
    let actif = true
    getDashboardStats()
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
              <AdminSectionCards stats={stats} />
              <div className="px-4 lg:px-6">
                <AdminChartInscriptions data={stats.inscriptions} />
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}
