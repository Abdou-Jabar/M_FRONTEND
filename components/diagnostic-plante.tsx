"use client"

// Diagnostic IA : l'agriculteur photographie une plante malade, l'image est
// analysée par Gemini côté backend (maladie, confiance, recommandation).
// La page affiche aussi l'historique paginé des diagnostics de l'utilisateur.

import { useCallback, useEffect, useRef, useState } from "react"
import {
  CameraIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Loader2Icon,
  UploadIcon,
  XIcon,
} from "lucide-react"
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
import { ApiError } from "@/lib/api"
import { useAuth } from "@/lib/auth/use-auth"
import {
  analyserImage,
  getDiagnosticsByUtilisateur,
} from "@/lib/diagnostics/diagnostic-service"
import type { DiagnosticIA } from "@/lib/diagnostics/types"

const TAILLE_MAX_OCTETS = 5 * 1024 * 1024 // aligné sur le backend (5 Mo)
const TYPES_ACCEPTES = ["image/jpeg", "image/png", "image/webp"]

function formaterDate(valeur: string): string {
  const date = new Date(valeur)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleString("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  })
}

export function DiagnosticPlante() {
  const { user } = useAuth()

  // Sélection / analyse
  const inputRef = useRef<HTMLInputElement>(null)
  const [fichier, setFichier] = useState<File | null>(null)
  const [apercu, setApercu] = useState<string | null>(null)
  const [analyse, setAnalyse] = useState(false)
  const [resultat, setResultat] = useState<DiagnosticIA | null>(null)

  // Historique
  const [historique, setHistorique] = useState<DiagnosticIA[]>([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [historiqueLoading, setHistoriqueLoading] = useState(true)

  const chargerHistorique = useCallback(
    (p: number) => {
      if (!user) return
      setHistoriqueLoading(true)
      getDiagnosticsByUtilisateur(user.utilisateurId, p, 6)
        .then((res) => {
          setHistorique(res.content)
          setTotalPages(res.totalPages)
          setPage(res.number)
        })
        .catch(() => {})
        .finally(() => setHistoriqueLoading(false))
    },
    [user],
  )

  // Chargement initial de l'historique (pattern « let actif » du projet :
  // pas de setState synchrone dans le corps de l'effet).
  useEffect(() => {
    if (!user) return
    let actif = true
    getDiagnosticsByUtilisateur(user.utilisateurId, 0, 6)
      .then((res) => {
        if (!actif) return
        setHistorique(res.content)
        setTotalPages(res.totalPages)
        setPage(res.number)
      })
      .catch(() => {})
      .finally(() => {
        if (actif) setHistoriqueLoading(false)
      })
    return () => {
      actif = false
    }
  }, [user])

  // Libère l'URL d'aperçu quand le fichier change / au démontage.
  useEffect(() => {
    return () => {
      if (apercu) URL.revokeObjectURL(apercu)
    }
  }, [apercu])

  function choisirFichier(f: File | null) {
    if (!f) return
    if (!TYPES_ACCEPTES.includes(f.type)) {
      toast.error("Format non supporté (JPEG, PNG ou WebP attendu).")
      return
    }
    if (f.size > TAILLE_MAX_OCTETS) {
      toast.error("L'image dépasse la taille maximale de 5 Mo.")
      return
    }
    setResultat(null)
    setFichier(f)
    setApercu(URL.createObjectURL(f))
  }

  async function lancerAnalyse() {
    if (!fichier || !user) return
    setAnalyse(true)
    try {
      const diag = await analyserImage(fichier, user.utilisateurId)
      setResultat(diag)
      setFichier(null)
      setApercu(null)
      chargerHistorique(0)
      toast.success("Analyse terminée.")
    } catch (e) {
      toast.error(
        e instanceof ApiError
          ? e.message
          : "Échec de l'analyse. Veuillez réessayer.",
      )
    } finally {
      setAnalyse(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-semibold tracking-tight">
          Diagnostic IA
        </h2>
        <p className="text-sm text-muted-foreground">
          Photographiez une plante malade : l&apos;intelligence artificielle
          identifie la maladie et vous conseille un traitement.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* ── Zone d'upload ───────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Analyser une photo</CardTitle>
            <CardDescription>
              JPEG, PNG ou WebP — 5 Mo maximum. Cadrez la partie malade
              (feuille, tige, fruit).
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <input
              ref={inputRef}
              type="file"
              accept={TYPES_ACCEPTES.join(",")}
              className="hidden"
              onChange={(e) => choisirFichier(e.target.files?.[0] ?? null)}
            />

            {apercu ? (
              <div className="relative overflow-hidden rounded-xl border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={apercu}
                  alt="Aperçu de la photo à analyser"
                  className="max-h-80 w-full object-contain"
                />
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute top-2 right-2 size-8"
                  onClick={() => {
                    setFichier(null)
                    setApercu(null)
                  }}
                  disabled={analyse}
                >
                  <XIcon className="size-4" />
                </Button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="flex h-48 w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed text-sm text-muted-foreground transition-colors hover:bg-muted/50"
              >
                <UploadIcon className="size-6" />
                Cliquer pour choisir une photo
              </button>
            )}

            <Button
              onClick={lancerAnalyse}
              disabled={!fichier || analyse}
              className="w-full"
            >
              {analyse ? (
                <>
                  <Loader2Icon className="size-4 animate-spin" />
                  Analyse en cours… (quelques secondes)
                </>
              ) : (
                <>
                  <CameraIcon className="size-4" />
                  Lancer l&apos;analyse
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* ── Résultat ────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Résultat</CardTitle>
            <CardDescription>
              Diagnostic fourni à titre indicatif — en cas de doute, ouvrez un
              ticket pour l&apos;équipe technique.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {resultat ? (
              <ResultatDiagnostic diagnostic={resultat} />
            ) : (
              <div className="flex h-48 items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground">
                {analyse
                  ? "L'IA analyse votre photo…"
                  : "Le résultat de l'analyse s'affichera ici."}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Historique ──────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold tracking-tight">
            Mes diagnostics
          </h3>
          {totalPages > 1 ? (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                disabled={page === 0}
                onClick={() => chargerHistorique(page - 1)}
              >
                <ChevronLeftIcon className="size-4" />
              </Button>
              <span className="text-sm tabular-nums text-muted-foreground">
                {page + 1} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                disabled={page >= totalPages - 1}
                onClick={() => chargerHistorique(page + 1)}
              >
                <ChevronRightIcon className="size-4" />
              </Button>
            </div>
          ) : null}
        </div>

        {historiqueLoading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-56 w-full rounded-xl" />
            ))}
          </div>
        ) : historique.length === 0 ? (
          <div className="flex items-center justify-center rounded-xl border border-dashed p-8 text-sm text-muted-foreground">
            Aucun diagnostic pour le moment.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {historique.map((d) => (
              <Card key={d.id} className="overflow-hidden pt-0">
                <div className="relative h-40 w-full bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={d.imageUrl}
                    alt={d.maladieDetectee}
                    className="size-full object-cover"
                  />
                </div>
                <CardContent className="flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium">{d.maladieDetectee}</p>
                    <Badge variant="secondary">{d.confiance}</Badge>
                  </div>
                  <p className="line-clamp-3 text-sm text-muted-foreground">
                    {d.recommendation}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formaterDate(d.createdAt)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Bloc de présentation du diagnostic (dernier résultat).
function ResultatDiagnostic({ diagnostic }: { diagnostic: DiagnosticIA }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="relative h-40 w-full overflow-hidden rounded-xl bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={diagnostic.imageUrl}
          alt={diagnostic.maladieDetectee}
          className="size-full object-cover"
        />
      </div>
      <div className="flex items-center justify-between gap-2">
        <p className="text-base font-semibold">
          {diagnostic.maladieDetectee}
        </p>
        <Badge>{diagnostic.confiance}</Badge>
      </div>
      <p className="text-sm whitespace-pre-line text-muted-foreground">
        {diagnostic.recommendation}
      </p>
    </div>
  )
}
