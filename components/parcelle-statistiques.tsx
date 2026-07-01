"use client"

// Statistiques d'une parcelle : un graphe par capteur du/des dispositif(s)
// rattaché(s). Sélecteur de période (7 / 30 / 90 jours).

import { useEffect, useState } from "react"

import { Skeleton } from "@/components/ui/skeleton"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import { MesureChart } from "@/components/mesure-chart"
import { ApiError } from "@/lib/api"
import { getParcelle } from "@/lib/parcelles/parcelle-service"
import {
  getStatistiquesParcelle,
  type CapteurStatistique,
} from "@/lib/parcelles/statistiques"

export function ParcelleStatistiques({ id }: { id: number }) {
  const [jours, setJours] = useState("30")
  const [nom, setNom] = useState("")
  const [series, setSeries] = useState<CapteurStatistique[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Nom de la parcelle (en-tête)
  useEffect(() => {
    let actif = true
    getParcelle(id)
      .then((p) => {
        if (actif) setNom(p.nom)
      })
      .catch(() => {
        /* l'erreur des statistiques suffit à informer l'utilisateur */
      })
    return () => {
      actif = false
    }
  }, [id])

  // Séries de mesures (rechargées au changement de période)
  useEffect(() => {
    let actif = true
    getStatistiquesParcelle(id, Number(jours))
      .then((data) => {
        if (!actif) return
        setSeries(data)
        setError(null)
      })
      .catch((e) => {
        if (!actif) return
        setError(
          e instanceof ApiError
            ? e.message
            : "Impossible de charger les statistiques.",
        )
      })
      .finally(() => {
        if (actif) setIsLoading(false)
      })
    return () => {
      actif = false
    }
  }, [id, jours])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-semibold tracking-tight">
            {nom || "Parcelle"}
          </h2>
          <p className="text-sm text-muted-foreground">
            Mesures relevées par les capteurs de la parcelle.
          </p>
        </div>
        <ToggleGroup
          type="single"
          value={jours}
          onValueChange={(v) => {
            if (v) setJours(v)
          }}
          variant="outline"
        >
          <ToggleGroupItem value="7">7 jours</ToggleGroupItem>
          <ToggleGroupItem value="30">30 jours</ToggleGroupItem>
          <ToggleGroupItem value="90">90 jours</ToggleGroupItem>
        </ToggleGroup>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-[330px] w-full rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed p-8 text-sm text-muted-foreground">
          {error}
        </div>
      ) : series.length === 0 ? (
        <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed p-8 text-sm text-muted-foreground">
          Aucun capteur n&apos;est rattaché à cette parcelle.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {series.map((serie) => (
            <MesureChart key={serie.capteurId} serie={serie} />
          ))}
        </div>
      )}
    </div>
  )
}
