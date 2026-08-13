"use client"

// Tableau de bord du technicien : statistiques personnelles calculées depuis
// ses missions (GET /affectations/mes-missions) — le tableau de bord global
// de la plateforme reste réservé au superviseur.

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  ArrowRightIcon,
  BuildingIcon,
  CheckCircle2Icon,
  ClipboardListIcon,
  PlayCircleIcon,
  TimerIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ApiError } from "@/lib/api"
import { getMesMissions } from "@/lib/affectations/affectation-service"
import type { Affectation } from "@/lib/affectations/types"

export function TechnicienDashboard() {
  const [missions, setMissions] = useState<Affectation[]>([])
  const [loading, setLoading] = useState(true)
  const [erreur, setErreur] = useState<string | null>(null)

  useEffect(() => {
    let actif = true
    getMesMissions()
      .then((data) => {
        if (actif) setMissions(data)
      })
      .catch((e) => {
        if (actif)
          setErreur(
            e instanceof ApiError
              ? e.message
              : "Impossible de charger vos missions.",
          )
      })
      .finally(() => {
        if (actif) setLoading(false)
      })
    return () => {
      actif = false
    }
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-xl" />
        ))}
      </div>
    )
  }

  if (erreur) {
    return <p className="px-4 text-sm text-destructive lg:px-6">{erreur}</p>
  }

  const aDemarrer = missions.filter((m) => m.statut === "A_DEMARRER")
  const enCours = missions.filter((m) => m.statut === "EN_COURS")
  const terminees = missions.filter((m) => m.statut === "TERMINEE")
  const organisations = new Set(missions.map((m) => m.organisationId))

  return (
    <>
      <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
        {/* Total des missions */}
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Missions totales</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {missions.length}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                <ClipboardListIcon className="size-4" />
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Missions qui vous sont affectées
            </div>
            <div className="text-muted-foreground">
              {organisations.size} organisation(s) distincte(s)
            </div>
          </CardFooter>
        </Card>

        {/* À démarrer */}
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>À démarrer</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {aDemarrer.length}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                <TimerIcon className="size-4" />
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              En attente de démarrage
            </div>
            <div className="text-muted-foreground">
              Démarrez-les depuis « Mes missions »
            </div>
          </CardFooter>
        </Card>

        {/* En cours */}
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>En cours</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {enCours.length}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                <PlayCircleIcon className="size-4" />
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Installations possibles
            </div>
            <div className="line-clamp-1 text-muted-foreground">
              {enCours.length > 0
                ? enCours.map((m) => m.organisationNom).join(" · ")
                : "Aucune mission démarrée"}
            </div>
          </CardFooter>
        </Card>

        {/* Terminées */}
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Terminées</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {terminees.length}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                <CheckCircle2Icon className="size-4" />
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Missions achevées
            </div>
            <div className="text-muted-foreground">
              {missions.length > 0
                ? `${Math.round((terminees.length / missions.length) * 100)} % de vos missions`
                : "Aucune mission pour le moment"}
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Accès rapides */}
      <div className="flex flex-wrap gap-2 px-4 lg:px-6">
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard/mes-missions">
            <ClipboardListIcon className="size-4" />
            Mes missions
            <ArrowRightIcon className="size-4" />
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard/installation">
            <BuildingIcon className="size-4" />
            Installation du matériel
            <ArrowRightIcon className="size-4" />
          </Link>
        </Button>
      </div>
    </>
  )
}
