"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card,
  CardAction,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { PointInscription } from "@/lib/stats/types"

const chartConfig = {
  organisations: {
    label: "Organisations",
    color: "var(--primary)",
  },
  utilisateurs: {
    label: "Utilisateurs",
    color: "var(--primary)",
  },
} satisfies ChartConfig

// Graphe interactif des inscriptions (organisations + utilisateurs) par jour.
// Reçoit la série complète (90 jours) et filtre selon la plage choisie.
export function AdminChartInscriptions({
  data,
}: {
  data: PointInscription[]
}) {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("90d")

  // Sur mobile, on bascule automatiquement sur 7 jours. Ajustement pendant le
  // rendu (pattern React conseillé) plutôt que dans un effet.
  const [prevIsMobile, setPrevIsMobile] = React.useState(isMobile)
  if (isMobile !== prevIsMobile) {
    setPrevIsMobile(isMobile)
    if (isMobile) {
      setTimeRange("7d")
    }
  }

  const filteredData = React.useMemo(() => {
    const jours = timeRange === "30d" ? 30 : timeRange === "7d" ? 7 : 90
    // La série est ordonnée par date croissante : on prend la fin.
    return data.slice(Math.max(0, data.length - jours))
  }, [data, timeRange])

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Inscriptions</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Organisations et utilisateurs inscrits par jour
          </span>
          <span className="@[540px]/card:hidden">Inscriptions / jour</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:px-4! @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">3 derniers mois</ToggleGroupItem>
            <ToggleGroupItem value="30d">30 derniers jours</ToggleGroupItem>
            <ToggleGroupItem value="7d">7 derniers jours</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Choisir une plage"
            >
              <SelectValue placeholder="3 derniers mois" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                3 derniers mois
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                30 derniers jours
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                7 derniers jours
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillOrganisations" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-organisations)"
                  stopOpacity={1.0}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-organisations)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillUtilisateurs" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-utilisateurs)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-utilisateurs)"
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
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("fr-FR", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString("fr-FR", {
                      month: "short",
                      day: "numeric",
                    })
                  }
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="utilisateurs"
              type="natural"
              fill="url(#fillUtilisateurs)"
              stroke="var(--color-utilisateurs)"
              stackId="a"
            />
            <Area
              dataKey="organisations"
              type="natural"
              fill="url(#fillOrganisations)"
              stroke="var(--color-organisations)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
