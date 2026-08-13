"use client"

// Accueil du dashboard équipe, selon le rôle :
//  - SUPERVISEUR : vue globale de la plateforme (GET /api/stats/dashboard).
//  - TECHNICIEN  : ses statistiques personnelles (missions, accès rapides).

import { useEffect, useState } from "react"

import { AdminSectionCards } from "@/components/admin-section-cards"
import { AdminChartInscriptions } from "@/components/admin-chart-inscriptions"
import { TechnicienDashboard } from "@/components/technicien-dashboard"
import { ApiError } from "@/lib/api"
import { useAuth } from "@/lib/auth/use-auth"
import { getDashboardStats } from "@/lib/stats/stats-service"
import type { DashboardStats } from "@/lib/stats/types"

export default function AdminDashboardPage() {
  const { user, isLoading: authLoading } = useAuth()
  const estTechnicien = user?.role === "TECHNICIEN"

  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [erreur, setErreur] = useState<string | null>(null)

  useEffect(() => {
    // La vue globale est réservée au superviseur : pas d'appel pour le
    // technicien (son composant charge lui-même ses missions).
    if (authLoading || estTechnicien) return
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
  }, [authLoading, estTechnicien])

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          {authLoading ? (
            <p className="px-4 text-sm text-muted-foreground lg:px-6">
              Chargement…
            </p>
          ) : estTechnicien ? (
            <TechnicienDashboard />
          ) : loading ? (
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
