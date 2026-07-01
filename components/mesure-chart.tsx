"use client"

// Graphe d'aire d'une série de mesures d'un capteur.
// Reprend le style du ChartAreaInteractive du dashboard.

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import Link from "next/link"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { TYPE_CAPTEUR_LABELS } from "@/lib/capteurs/types"
import type { CapteurStatistique } from "@/lib/parcelles/statistiques"

export function MesureChart({
  serie,
  parcelleNom,
  href,
}: {
  serie: CapteurStatistique
  // Optionnel : affiche aussi la parcelle dans la description (aperçu dashboard).
  parcelleNom?: string
  // Optionnel : rend le titre cliquable vers la page de détail du capteur.
  href?: string
}) {
  const config = {
    valeur: { label: serie.capteurNom, color: "var(--primary)" },
  } satisfies ChartConfig

  const gradientId = `fill-capteur-${serie.capteurId}`

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>
          {href ? (
            <Link href={href} className="hover:underline">
              {serie.capteurNom}
            </Link>
          ) : (
            serie.capteurNom
          )}
        </CardTitle>
        <CardDescription>
          {TYPE_CAPTEUR_LABELS[serie.type]}
          {parcelleNom ? ` · ${parcelleNom}` : ""} · unité : {serie.unite}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {serie.points.length === 0 ? (
          <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
            Aucune mesure sur la période.
          </div>
        ) : (
          <ChartContainer
            config={config}
            className="aspect-auto h-[250px] w-full"
          >
            <AreaChart data={serie.points}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-valeur)"
                    stopOpacity={1.0}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-valeur)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) =>
                  new Date(value).toLocaleDateString("fr-FR", {
                    month: "short",
                    day: "numeric",
                  })
                }
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={40}
                tickMargin={8}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    indicator="dot"
                    labelFormatter={(value) =>
                      new Date(value).toLocaleString("fr-FR", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })
                    }
                  />
                }
              />
              <Area
                dataKey="valeur"
                type="natural"
                fill={`url(#${gradientId})`}
                stroke="var(--color-valeur)"
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
