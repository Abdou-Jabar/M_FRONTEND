"use client"

// Page de comparaison multi-parcelles.
// L'utilisateur choisit :
//   - 2 parcelles (ou plus) à comparer
//   - 1 facteur (type de capteur)
//   - La période (7 / 30 / 90 jours)
//
// Deux graphes sont affichés :
//   1. LineChart multi-lignes (évolution dans le temps)
//   2. BarChart (moyenne par parcelle)

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { RefreshCwIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { AnalyseSadPanneau } from "@/components/analyse-sad"
import { ComparaisonParcelles } from "@/components/comparaison-parcelles"
import { MesureChartBarre } from "@/components/mesure-chart-barre"
import { ApiError } from "@/lib/api"
import { getParcelles } from "@/lib/parcelles/parcelle-service"
import {
  comparerParcelles,
  type SerieComparaison,
} from "@/lib/parcelles/statistiques"
import type { Parcelle } from "@/lib/parcelles/types"
import {
  TYPE_CAPTEUR_LABELS,
  TYPE_CAPTEUR_OPTIONS,
  type TypeCapteur,
} from "@/lib/capteurs/types"

const JOURS_OPTIONS = [
  { value: "7",  label: "7 jours" },
  { value: "30", label: "30 jours" },
  { value: "90", label: "90 jours" },
]

export default function ComparerPage() {
  const [parcelles, setParcelles] = useState<Parcelle[]>([])
  const [selected, setSelected] = useState<number[]>([])
  const [type, setType] = useState<TypeCapteur>("HUMIDITE_SOL")
  const [jours, setJours] = useState("30")

  const [series, setSeries] = useState<SerieComparaison[] | null>(null)
  const [chargement, setChargement] = useState(false)
  const [erreur, setErreur] = useState<string | null>(null)
  const [parcellesLoading, setParcellesLoading] = useState(true)

  // Chargement de la liste des parcelles accessibles.
  useEffect(() => {
    let actif = true
    getParcelles()
      .then((data) => {
        if (!actif) return
        setParcelles(data)
      })
      .catch(() => {})
      .finally(() => {
        if (actif) setParcellesLoading(false)
      })
    return () => {
      actif = false
    }
  }, [])

  function toggleParcelle(id: number) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
    setSeries(null) // réinitialise quand la sélection change
  }

  async function handleComparer() {
    if (selected.length < 2) {
      toast.error("Sélectionnez au moins 2 parcelles à comparer.")
      return
    }
    setChargement(true)
    setErreur(null)
    setSeries(null)
    try {
      const data = await comparerParcelles(selected, type, Number(jours))
      setSeries(data)
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "Comparaison impossible."
      setErreur(msg)
      toast.error(msg)
    } finally {
      setChargement(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      {/* En-tête */}
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-semibold tracking-tight">
          Comparer des parcelles
        </h2>
        <p className="text-sm text-muted-foreground">
          Choisissez au moins deux parcelles, un facteur et une période pour
          visualiser leur évolution côte à côte.
        </p>
      </div>

      {/* Panneau de sélection */}
      <div className="flex flex-col gap-4 rounded-xl border p-4">
        {/* Sélection des parcelles */}
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">
            Parcelles{" "}
            <span className="text-muted-foreground font-normal">
              (min. 2, max. 5)
            </span>
          </span>
          {parcellesLoading ? (
            <div className="flex gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-28 rounded-full" />
              ))}
            </div>
          ) : parcelles.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aucune parcelle disponible.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {parcelles.map((p) => {
                const actif = selected.includes(p.id)
                const limite = !actif && selected.length >= 5
                return (
                  <button
                    key={p.id}
                    type="button"
                    disabled={limite}
                    onClick={() => toggleParcelle(p.id)}
                    className="focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Badge
                      variant={actif ? "default" : "outline"}
                      className={
                        limite
                          ? "cursor-not-allowed opacity-40"
                          : "cursor-pointer"
                      }
                    >
                      {p.nom}
                    </Badge>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Facteur */}
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium">Facteur</span>
            <Select
              value={type}
              onValueChange={(v) => {
                setType(v as TypeCapteur)
                setSeries(null)
              }}
            >
              <SelectTrigger className="w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TYPE_CAPTEUR_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Période */}
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium">Période</span>
            <ToggleGroup
              type="single"
              value={jours}
              onValueChange={(v) => {
                if (v) {
                  setJours(v)
                  setSeries(null)
                }
              }}
              variant="outline"
            >
              {JOURS_OPTIONS.map((o) => (
                <ToggleGroupItem key={o.value} value={o.value}>
                  {o.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          <Button
            onClick={handleComparer}
            disabled={chargement || selected.length < 2}
            className="self-end"
          >
            <RefreshCwIcon
              className={`size-4 ${chargement ? "animate-spin" : ""}`}
            />
            {chargement ? "Chargement…" : "Comparer"}
          </Button>
        </div>
      </div>

      {/* Résumé sélection */}
      {selected.length > 0 && !series && !chargement && (
        <p className="text-sm text-muted-foreground">
          {selected.length} parcelle{selected.length > 1 ? "s" : ""}{" "}
          sélectionnée{selected.length > 1 ? "s" : ""} ·{" "}
          {TYPE_CAPTEUR_LABELS[type]} · {jours} jours —{" "}
          {selected.length < 2
            ? "sélectionnez au moins 2 parcelles"
            : 'cliquez sur « Comparer »'}
        </p>
      )}

      {/* Skeletons pendant le chargement */}
      {chargement && (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-[320px] w-full rounded-xl" />
          <Skeleton className="h-[280px] w-full rounded-xl" />
        </div>
      )}

      {/* Erreur */}
      {erreur && !chargement && (
        <div className="flex items-center justify-center rounded-xl border border-dashed p-8 text-sm text-destructive">
          {erreur}
        </div>
      )}

      {/* Graphes */}
      {series && !chargement && (
        <div className="flex flex-col gap-6">
          {/* 1. LineChart — évolution temporelle (Option A) */}
          <ComparaisonParcelles
            series={series}
            type={type}
            jours={Number(jours)}
          />

          {/* 2. BarChart — moyennes comparées */}
          <MesureChartBarre
            series={series}
            type={type}
            jours={Number(jours)}
          />
        </div>
      )}

      {/* Analyse SAD — scores + rapport IA (indépendante des graphes) */}
      {selected.length >= 2 && (
        <AnalyseSadPanneau parcelleIds={selected} jours={Number(jours)} />
      )}
    </div>
  )
}
