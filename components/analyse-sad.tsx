"use client"

// Analyse SAD : classement des parcelles (scores calculés par le backend)
// + rapport agronomique rédigé par l'IA.

import { useState } from "react"
import { BrainCircuitIcon, TrophyIcon } from "lucide-react"
import { toast } from "sonner"

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
import { cn } from "@/lib/utils"
import { ApiError } from "@/lib/api"
import { analyserParcelles } from "@/lib/sad/sad-service"
import type { AnalyseSad, ParcelleScore } from "@/lib/sad/types"

const TYPE_SOL_LABELS: Record<string, string> = {
  ARGILEUX: "Argileux",
  SABLONNEUX: "Sablonneux",
  LIMONEUX: "Limoneux",
  HUMIFERE: "Humifère",
  LATERITIQUE: "Latéritique",
}

function couleurScore(score: number | null): string {
  if (score == null) return "text-muted-foreground"
  if (score >= 70) return "text-green-600 dark:text-green-400"
  if (score >= 40) return "text-amber-600 dark:text-amber-400"
  return "text-destructive"
}

function ScoreItem({ label, valeur }: { label: string; valeur: number | null }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span
        className={cn(
          "text-lg font-semibold tabular-nums",
          couleurScore(valeur),
        )}
      >
        {valeur != null ? `${valeur} %` : "—"}
      </span>
    </div>
  )
}

function CarteScore({ score }: { score: ParcelleScore }) {
  const premier = score.rang === 1 && score.scoreGlobal != null
  return (
    <Card className={cn(premier && "border-primary/50")}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          {premier ? (
            <TrophyIcon className="size-4 text-amber-500" />
          ) : (
            <span className="text-muted-foreground">#{score.rang}</span>
          )}
          {score.parcelleNom}
        </CardTitle>
        <CardDescription className="flex flex-wrap gap-1.5">
          {score.typeSol && (
            <Badge variant="outline">
              {TYPE_SOL_LABELS[score.typeSol] ?? score.typeSol}
            </Badge>
          )}
          {score.cultureNom && <Badge variant="outline">{score.cultureNom}</Badge>}
          <Badge variant="outline">{score.nbMesures} mesures</Badge>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {score.scoreGlobal == null ? (
          <p className="text-sm text-muted-foreground">
            Pas assez de mesures sur la période.
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            <ScoreItem label="Score global" valeur={score.scoreGlobal} />
            <ScoreItem label="Stabilité" valeur={score.scoreStabilite} />
            <ScoreItem label="Conformité" valeur={score.scoreConformite} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Rendu léger du markdown produit par l'IA (##, ###, listes, **gras**).
function RapportMarkdown({ texte }: { texte: string }) {
  const lignes = texte.split("\n")
  return (
    <div className="flex flex-col gap-1.5 text-sm leading-relaxed">
      {lignes.map((ligne, i) => {
        const l = ligne.trim()
        if (!l) return null
        if (l.startsWith("###"))
          return (
            <h4 key={i} className="mt-3 font-semibold">
              {enGras(l.replace(/^#+\s*/, ""))}
            </h4>
          )
        if (l.startsWith("##"))
          return (
            <h3 key={i} className="mt-4 text-base font-semibold">
              {enGras(l.replace(/^#+\s*/, ""))}
            </h3>
          )
        if (/^[-*]\s+/.test(l))
          return (
            <p key={i} className="pl-4">
              • {enGras(l.replace(/^[-*]\s+/, ""))}
            </p>
          )
        return <p key={i}>{enGras(l)}</p>
      })}
    </div>
  )
}

// Transforme les segments **gras** en <strong>.
function enGras(texte: string): React.ReactNode {
  const morceaux = texte.split(/(\*\*[^*]+\*\*)/g)
  if (morceaux.length === 1) return texte
  return morceaux.map((m, i) =>
    m.startsWith("**") && m.endsWith("**") ? (
      <strong key={i}>{m.slice(2, -2)}</strong>
    ) : (
      m
    ),
  )
}

export function AnalyseSadPanneau({
  parcelleIds,
  jours,
}: {
  parcelleIds: number[]
  jours: number
}) {
  const [analyse, setAnalyse] = useState<AnalyseSad | null>(null)
  const [chargement, setChargement] = useState(false)

  async function handleAnalyser() {
    setChargement(true)
    setAnalyse(null)
    try {
      const data = await analyserParcelles(parcelleIds, jours)
      setAnalyse(data)
    } catch (e) {
      toast.error(
        e instanceof ApiError ? e.message : "Analyse impossible pour le moment.",
      )
    } finally {
      setChargement(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <h3 className="flex items-center gap-2 font-semibold">
            <BrainCircuitIcon className="size-4" />
            Analyse comparative IA
          </h3>
          <p className="text-sm text-muted-foreground">
            Scores de stabilité et de conformité aux seuils calculés sur{" "}
            {jours} jours, puis rapport agronomique rédigé par l&apos;IA.
          </p>
        </div>
        <Button
          onClick={handleAnalyser}
          disabled={chargement || parcelleIds.length < 2}
        >
          <BrainCircuitIcon
            className={cn("size-4", chargement && "animate-pulse")}
          />
          {chargement ? "Analyse en cours…" : "Lancer l'analyse"}
        </Button>
      </div>

      {chargement && (
        <div className="flex flex-col gap-3">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {parcelleIds.slice(0, 3).map((id) => (
              <Skeleton key={id} className="h-32 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-48 rounded-xl" />
          <p className="text-center text-xs text-muted-foreground">
            La rédaction du rapport peut prendre quelques secondes…
          </p>
        </div>
      )}

      {analyse && !chargement && (
        <div className="flex flex-col gap-4">
          {/* Classement */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {analyse.classement.map((s) => (
              <CarteScore key={s.parcelleId} score={s} />
            ))}
          </div>

          {/* Rapport IA */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Rapport agronomique</CardTitle>
              <CardDescription>
                Rédigé par IA à partir des scores ci-dessus — à considérer
                comme une aide à la décision, pas une expertise de terrain.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RapportMarkdown texte={analyse.rapport} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
