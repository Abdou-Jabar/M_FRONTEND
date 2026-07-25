"use client"

// Cartes de synthèse orientées agriculteur : on met en avant l'activité
// agricole (parcelles, cultures, alertes) et non les concepts techniques
// (dispositifs, capteurs) qui ne concernent pas l'agriculteur.

import { MapIcon, SproutIcon, TriangleAlertIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { DashboardClient } from "@/lib/stats/types"

export function AgriculteurSectionCards({ stats }: { stats: DashboardClient }) {
  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-3 dark:*:data-[slot=card]:bg-card">
      {/* Parcelles */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Mes parcelles</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.totalParcelles}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <MapIcon className="size-4" />
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Parcelles suivies
          </div>
          <div className="text-muted-foreground">
            Les espaces que vous cultivez
          </div>
        </CardFooter>
      </Card>

      {/* Cultures en cours */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Cultures en cours</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.culturesActives}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <SproutIcon className="size-4" />
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {stats.culturesActives > 0
              ? "Suivi en cours"
              : "Aucune culture en cours"}
          </div>
          <div className="text-muted-foreground">
            Cultures actuellement suivies
          </div>
        </CardFooter>
      </Card>

      {/* Alertes actives */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Alertes</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.alertesActives}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TriangleAlertIcon className="size-4" />
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {stats.alertesActives > 0
              ? "Des points nécessitent votre attention"
              : "Tout est au vert"}
          </div>
          <div className="text-muted-foreground">
            Alertes non résolues sur vos parcelles
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
