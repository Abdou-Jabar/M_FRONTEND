"use client"

import { TrendingDownIcon, TrendingUpIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { DashboardStats } from "@/lib/stats/types"

// Badge de tendance : flèche montante/descendante + pourcentage signé.
function BadgeTendance({ valeur }: { valeur: number }) {
  const positif = valeur >= 0
  const Icon = positif ? TrendingUpIcon : TrendingDownIcon
  const signe = positif ? "+" : ""
  return (
    <Badge variant="outline">
      <Icon className="size-4" />
      {signe}
      {valeur}%
    </Badge>
  )
}

// Texte d'accompagnement selon le sens de la tendance.
function texteTendance(valeur: number, libelle: string) {
  if (valeur > 0) return `En hausse ce mois-ci`
  if (valeur < 0) return `En baisse ce mois-ci`
  return `Stable ce mois-ci (${libelle})`
}

export function AdminSectionCards({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      {/* Organisations */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Organisations</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.totalOrganisations}
          </CardTitle>
          <CardAction>
            <BadgeTendance valeur={stats.tendanceOrganisations} />
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {texteTendance(stats.tendanceOrganisations, "organisations")}
          </div>
          <div className="text-muted-foreground">
            {stats.organisationsActives} active(s) ·{" "}
            {stats.organisationsEnAttente} en attente
          </div>
        </CardFooter>
      </Card>

      {/* Utilisateurs (clients) */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Utilisateurs</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.totalUtilisateurs}
          </CardTitle>
          <CardAction>
            <BadgeTendance valeur={stats.tendanceUtilisateurs} />
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {texteTendance(stats.tendanceUtilisateurs, "utilisateurs")}
          </div>
          <div className="text-muted-foreground">
            {stats.totalAdmins} admin(s) · {stats.totalAgriculteurs}{" "}
            agriculteur(s)
          </div>
        </CardFooter>
      </Card>

      {/* Techniciens */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Techniciens</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.totalTechniciens}
          </CardTitle>
          <CardAction>
            <BadgeTendance valeur={stats.tendanceTechniciens} />
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {texteTendance(stats.tendanceTechniciens, "techniciens")}
          </div>
          <div className="text-muted-foreground">Équipe terrain AgriSmart</div>
        </CardFooter>
      </Card>

      {/* Organisations actives */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Organisations actives</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.organisationsActives}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {stats.totalOrganisations > 0
                ? Math.round(
                    (stats.organisationsActives / stats.totalOrganisations) *
                      100,
                  )
                : 0}
              %
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Part des organisations validées
          </div>
          <div className="text-muted-foreground">
            {stats.organisationsSuspendues} suspendue(s)
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
