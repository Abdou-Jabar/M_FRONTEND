"use client"

// Widget météo affiché sur les parcelles en plein air.
// Données en temps réel via Open-Meteo (gratuit, sans clé API).

import { useEffect, useState } from "react"
import { DropletIcon, ThermometerIcon, WindIcon } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  descriptionMeteo,
  getMeteo,
  type MeteoActuelle,
} from "@/lib/meteo/meteo-service"

function formaterHeure(iso: string): string {
  return new Date(iso).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function MeteoWidget({
  latitude,
  longitude,
  parcelleNom,
}: {
  latitude: number
  longitude: number
  parcelleNom: string
}) {
  const [meteo, setMeteo] = useState<MeteoActuelle | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let actif = true
    getMeteo(latitude, longitude)
      .then((data) => {
        if (actif) {
          setMeteo(data)
          setError(null)
        }
      })
      .catch(() => {
        if (actif) setError("Météo indisponible pour cette localisation.")
      })
      .finally(() => {
        if (actif) setIsLoading(false)
      })
    return () => {
      actif = false
    }
  }, [latitude, longitude])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-28" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-24 rounded-xl" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !meteo) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex items-center justify-center p-6 text-sm text-muted-foreground">
          {error ?? "Météo indisponible."}
        </CardContent>
      </Card>
    )
  }

  const desc = descriptionMeteo(meteo.codeMeteo)

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="text-2xl" aria-hidden="true">
            {desc.emoji}
          </span>
          Météo actuelle — {parcelleNom}
        </CardTitle>
        <CardDescription>
          {desc.libelle} · Mise à jour à {formaterHeure(meteo.heure)} ·{" "}
          <span className="text-xs">Source : Open-Meteo</span>
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {/* Température */}
          <div className="flex flex-col gap-1 rounded-xl bg-muted/40 p-3">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <ThermometerIcon className="size-3" />
              Température
            </div>
            <span className="text-2xl font-semibold tabular-nums">
              {meteo.temperature}°C
            </span>
            <span className="text-xs text-muted-foreground">
              Ressenti {meteo.temperatureRessentie}°C
            </span>
          </div>

          {/* Humidité */}
          <div className="flex flex-col gap-1 rounded-xl bg-muted/40 p-3">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <DropletIcon className="size-3" />
              Humidité
            </div>
            <span className="text-2xl font-semibold tabular-nums">
              {meteo.humidite}%
            </span>
            <span className="text-xs text-muted-foreground">Humidité relative</span>
          </div>

          {/* Précipitations */}
          <div className="flex flex-col gap-1 rounded-xl bg-muted/40 p-3">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <DropletIcon className="size-3" />
              Precipitations
            </div>
            <span className="text-2xl font-semibold tabular-nums">
              {meteo.precipitation} mm
            </span>
            <span className="text-xs text-muted-foreground">Dernière heure</span>
          </div>

          {/* Vent */}
          <div className="flex flex-col gap-1 rounded-xl bg-muted/40 p-3">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <WindIcon className="size-3" />
              Vent
            </div>
            <span className="text-2xl font-semibold tabular-nums">
              {meteo.vitesseVent} km/h
            </span>
            <span className="text-xs text-muted-foreground">Vitesse à 10 m</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
