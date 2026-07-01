"use client"

// Page de détail d'un capteur : informations sur le capteur, son dispositif et
// sa parcelle, graphe des mesures et statistiques (moyenne, min, max).
// Tout provient d'un seul appel tenant-safe : GET /api/mesures/capteur/{id}/detail.

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeftIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { MesureChart } from "@/components/mesure-chart"
import { ApiError } from "@/lib/api"
import { TYPE_CAPTEUR_LABELS } from "@/lib/capteurs/types"
import { getCapteurDetail, type CapteurDetail } from "@/lib/capteurs/detail"
import {
  STATUT_DISPOSITIF_BADGE,
  STATUT_DISPOSITIF_LABELS,
} from "@/lib/dispositifs/types"
import { ENVIRONNEMENT_LABELS } from "@/lib/parcelles/types"
import type { CapteurStatistique } from "@/lib/parcelles/statistiques"

// Formate un nombre avec au plus une décimale.
function fmt(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1)
}

export default function CapteurDetailPage() {
  const params = useParams<{ id: string }>()
  const id = Number(params.id)

  const [detail, setDetail] = useState<CapteurDetail | null>(null)
  const [jours, setJours] = useState("30")
  const [loading, setLoading] = useState(true)
  const [erreur, setErreur] = useState<string | null>(null)

  // Détail + série, rechargés au changement de période.
  useEffect(() => {
    let actif = true
    getCapteurDetail(id, Number(jours))
      .then((data) => {
        if (actif) {
          setDetail(data)
          setErreur(null)
        }
      })
      .catch((e) => {
        if (actif)
          setErreur(
            e instanceof ApiError ? e.message : "Capteur introuvable.",
          )
      })
      .finally(() => {
        if (actif) setLoading(false)
      })
    return () => {
      actif = false
    }
  }, [id, jours])

  if (loading && !detail) {
    return (
      <div className="flex flex-col gap-4 p-4 md:p-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-[330px] w-full rounded-xl" />
      </div>
    )
  }

  if (erreur || !detail) {
    return (
      <div className="flex flex-col gap-4 p-4 md:p-6">
        <Button variant="outline" size="sm" asChild className="w-fit">
          <Link href="/dashboard/capteurs">
            <ArrowLeftIcon className="size-4" />
            Retour aux capteurs
          </Link>
        </Button>
        <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed p-8 text-sm text-muted-foreground">
          {erreur ?? "Capteur introuvable."}
        </div>
      </div>
    )
  }

  const points = detail.points
  const moyenne =
    points.length > 0
      ? points.reduce((s, p) => s + p.valeur, 0) / points.length
      : null
  const min = points.length > 0 ? Math.min(...points.map((p) => p.valeur)) : null
  const max = points.length > 0 ? Math.max(...points.map((p) => p.valeur)) : null

  // Objet attendu par le composant de graphe réutilisé.
  const serie: CapteurStatistique = {
    capteurId: detail.capteurId,
    capteurNom: detail.capteurNom,
    type: detail.type,
    unite: detail.unite,
    valeurMin: detail.valeurMin,
    valeurMax: detail.valeurMax,
    points: detail.points,
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div className="flex flex-col gap-1">
          <Button variant="ghost" size="sm" asChild className="-ml-2 w-fit">
            <Link href="/dashboard/capteurs">
              <ArrowLeftIcon className="size-4" />
              Capteurs
            </Link>
          </Button>
          <h2 className="text-2xl font-semibold tracking-tight">
            {detail.capteurNom}
          </h2>
          <p className="text-sm text-muted-foreground">
            {TYPE_CAPTEUR_LABELS[detail.type]}
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

      {/* Informations capteur / dispositif / parcelle */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Capteur</CardDescription>
            <CardTitle className="text-lg">{detail.capteurNom}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-1 text-sm">
            <Ligne libelle="Type" valeur={TYPE_CAPTEUR_LABELS[detail.type]} />
            {detail.modele ? (
              <Ligne libelle="Modèle" valeur={detail.modele} />
            ) : null}
            <Ligne libelle="Unité" valeur={detail.unite} />
            <Ligne
              libelle="Plage"
              valeur={`${detail.valeurMin} – ${detail.valeurMax} ${detail.unite}`}
            />
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Statut</span>
              <Badge variant={detail.actif ? "default" : "secondary"}>
                {detail.actif ? "Actif" : "Inactif"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Dispositif</CardDescription>
            <CardTitle className="text-lg">{detail.dispositifNom}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-1 text-sm">
            <Ligne libelle="Adresse MAC" valeur={detail.dispositifAdresseMac} />
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Statut</span>
              <Badge variant={STATUT_DISPOSITIF_BADGE[detail.dispositifStatut]}>
                {STATUT_DISPOSITIF_LABELS[detail.dispositifStatut]}
              </Badge>
            </div>
            <Ligne
              libelle="Batterie"
              valeur={`${detail.dispositifBatteriePct} %`}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Parcelle</CardDescription>
            <CardTitle className="text-lg">{detail.parcelleNom}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-1 text-sm">
            <Ligne
              libelle="Environnement"
              valeur={ENVIRONNEMENT_LABELS[detail.parcelleEnvironnement]}
            />
            <Button
              variant="link"
              size="sm"
              asChild
              className="h-auto w-fit p-0"
            >
              <Link href={`/dashboard/parcelles/${detail.parcelleId}`}>
                Voir la parcelle
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Statistiques : moyenne, min, max */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Moyenne ({jours} j)</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums">
              {moyenne !== null ? `${fmt(moyenne)} ${detail.unite}` : "—"}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {points.length} mesure(s) sur la période
          </CardContent>
        </Card>
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Minimum</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums">
              {min !== null ? `${fmt(min)} ${detail.unite}` : "—"}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Maximum</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums">
              {max !== null ? `${fmt(max)} ${detail.unite}` : "—"}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Graphe des mesures */}
      <MesureChart serie={serie} parcelleNom={detail.parcelleNom} />
    </div>
  )
}

// Petite ligne libellé / valeur réutilisée dans les cartes d'information.
function Ligne({ libelle, valeur }: { libelle: string; valeur: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-muted-foreground">{libelle}</span>
      <span className="text-right font-medium">{valeur}</span>
    </div>
  )
}
