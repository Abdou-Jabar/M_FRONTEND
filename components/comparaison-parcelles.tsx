"use client"

// Graphe de comparaison multi-parcelles (Option A) :
// plusieurs lignes de couleurs différentes sur le même axe temporel,
// une ligne par parcelle, pour un facteur donné.

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
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

// Arrondit une date ISO à la minute (tronque les secondes/ms)
// pour que des mesures quasi-simultanées de plusieurs parcelles
// se retrouvent sur le même point de l'axe temporel.
function arrondirALaMinute(dateIso: string): string {
  const d = new Date(dateIso)
  d.setSeconds(0, 0)
  return d.toISOString()
}

// Fusionne plusieurs séries temporelles en un tableau de points communs.
// Les dates sont arrondies à la minute pour aligner les séries entre elles.
function fusionnerSeries(
  series: SerieComparaison[],
): Record<string, string | number>[] {
  // Construction d'un map date (arrondie) → valeur par parcelle
  type ParMap = Map<string, number>
  const parParcelleMap: Map<string, ParMap> = new Map()

  for (const s of series) {
    const m: ParMap = new Map()
    for (const p of s.points) {
      const cle = arrondirALaMinute(p.date)
      // Si plusieurs mesures tombent dans la même minute, on garde la dernière
      m.set(cle, p.valeur)
    }
    parParcelleMap.set(s.parcelleNom, m)
  }

  // Union de toutes les dates arrondies, triées
  const datesSet = new Set<string>()
  for (const m of parParcelleMap.values()) {
    for (const d of m.keys()) datesSet.add(d)
  }
  const dates = Array.from(datesSet).sort()

  return dates.map((date) => {
    const row: Record<string, string | number> = { date }
    for (const s of series) {
      const val = parParcelleMap.get(s.parcelleNom)?.get(date)
      row[s.parcelleNom] = val !== undefined ? val : NaN
    }
    return row
  })
}

export function ComparaisonParcelles({
  series,
  type,
  jours,
}: {
  series: SerieComparaison[]
  type: TypeCapteur
  jours: number
}) {
  const unite = series[0]?.unite ?? ""
  const data = fusionnerSeries(series)

  const config: ChartConfig = Object.fromEntries(
    series.map((s, i) => [
      s.parcelleNom,
      {
        label: s.parcelleNom,
        color: COULEURS[i % COULEURS.length],
      },
    ]),
  )

  const aDesPoints = series.some((s) => s.points.length > 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {TYPE_CAPTEUR_LABELS[type]} — évolution comparée
        </CardTitle>
        <CardDescription>
          {jours} dernier{jours > 1 ? "s" : ""} jour{jours > 1 ? "s" : ""} ·
          unité : {unite}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {!aDesPoints ? (
          <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
            Aucune mesure disponible sur la période pour ce facteur.
          </div>
        ) : (
          <ChartContainer config={config} className="h-[300px] w-full">
            <LineChart
              data={data}
              margin={{ top: 4, right: 12, left: 0, bottom: 4 }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(v) =>
                  new Date(v).toLocaleDateString("fr-FR", {
                    month: "short",
                    day: "numeric",
                  })
                }
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={48}
                tickMargin={8}
                unit={` ${unite}`}
              />
              <Tooltip
                labelFormatter={(v) =>
                  new Date(v).toLocaleString("fr-FR", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })
                }
                formatter={(value, name) => [
                  value == null || (typeof value === "number" && isNaN(value))
                    ? "—"
                    : `${value} ${unite}`,
                  String(name),
                ]}
              />
              <Legend verticalAlign="top" height={36} />
              {series.map((s, i) => (
                <Line
                  key={s.parcelleId}
                  type="monotone"
                  dataKey={s.parcelleNom}
                  stroke={COULEURS[i % COULEURS.length]}
                  strokeWidth={2}
                  dot={data.length <= 20}
                  activeDot={{ r: 4 }}
                  connectNulls={true}
                />
              ))}
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
