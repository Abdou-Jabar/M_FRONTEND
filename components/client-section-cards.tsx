"use client"

import {
  MapIcon,
  CpuIcon,
  RadioIcon,
  TriangleAlertIcon,
} from "lucide-react"

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

export function ClientSectionCards({ stats }: { stats: DashboardClient }) {
  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      {/* Parcelles */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Parcelles</CardDescription>
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
            {stats.totalCapteurs} capteur(s) au total
          </div>
        </CardFooter>
      </Card>

      {/* Dispositifs */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Dispositifs</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.totalDispositifs}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <CpuIcon className="size-4" />
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {stats.dispositifsEnLigne} en ligne
          </div>
          <div className="text-muted-foreground">
            {stats.dispositifsHorsLigne} hors ligne
          </div>
        </CardFooter>
      </Card>

      {/* Capteurs */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Capteurs</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.totalCapteurs}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <RadioIcon className="size-4" />
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Capteurs installés
          </div>
          <div className="text-muted-foreground">
            Répartis sur {stats.totalDispositifs} dispositif(s)
          </div>
        </CardFooter>
      </Card>

      {/* Alertes actives */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Alertes actives</CardDescription>
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
              ? "Des alertes nécessitent votre attention"
              : "Aucune alerte active"}
          </div>
          <div className="text-muted-foreground">Alertes non résolues</div>
        </CardFooter>
      </Card>
    </div>
  )
}
