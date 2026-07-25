"use client"

// Graphe en barres : comparaison de la valeur moyenne d'un facteur
// par parcelle (ou par période). Utilisé dans la page de comparaison.

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ChartContainer, type ChartConfig } from "@/components/ui/chart"
import { TYPE_CAPTEUR_LABELS, type TypeCapteur } from "@/lib/capteurs/types"
import type { SerieComparaison } from "@/lib/parcelles/statistiques"

// Palette de couleurs vives — indépendante des variables CSS du thème
// qui sont toutes des gris sur ce projet.
const COULEURS = [
  "#22c55e", // vert
  "#3b82f6", // bleu
  "#f97316", // orange
  "#a855f7", // violet
  "#ef4444", // rouge
]

function moyenne(points: { valeur: number }[]): number {
  if (points.length === 0) return 0
  return points.reduce((s, p) => s + p.valeur, 0) / points.length
}

export function MesureChartBarre({
  series,
  type,
  jours,
}: {
  series: SerieComparaison[]
  type: TypeCapteur
  jours: number
}) {
  const data = series.map((s) => ({
    parcelle: s.parcelleNom,
    valeur: parseFloat(moyenne(s.points).toFixed(2)),
  }))

  const unite = series[0]?.unite ?? ""

  const config: ChartConfig = Object.fromEntries(
    series.map((s, i) => [
      s.parcelleNom,
      {
        label: s.parcelleNom,
        color: COULEURS[i % COULEURS.length],
      },
    ]),
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comparaison — {TYPE_CAPTEUR_LABELS[type]}</CardTitle>
        <CardDescription>
          Valeur moyenne sur {jours} jour{jours > 1 ? "s" : ""} · unité : {unite}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {data.every((d) => d.valeur === 0) ? (
          <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
            Aucune mesure sur la période pour ce facteur.
          </div>
        ) : (
          <ChartContainer config={config} className="h-[250px] w-full">
            <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="parcelle"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={45}
                tickMargin={8}
                unit={` ${unite}`}
              />
              <Tooltip
                formatter={(value) =>
                  [`${value ?? "—"} ${unite}`, "Moyenne"]
                }
              />
              <Bar dataKey="valeur" radius={[6, 6, 0, 0]}>
                {data.map((_, i) => (
                  <Cell
                    key={i}
                    fill={COULEURS[i % COULEURS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
