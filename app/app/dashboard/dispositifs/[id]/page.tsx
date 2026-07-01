"use client"

// Page de détail d'un dispositif : toutes ses informations + la liste de ses
// capteurs (cliquables vers le détail du capteur).

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeftIcon, PencilIcon } from "lucide-react"

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ApiError } from "@/lib/api"
import { getDispositif } from "@/lib/dispositifs/dispositif-service"
import {
  STATUT_DISPOSITIF_BADGE,
  STATUT_DISPOSITIF_LABELS,
  type Dispositif,
} from "@/lib/dispositifs/types"
import { getCapteursByDispositif } from "@/lib/capteurs/capteur-service"
import { TYPE_CAPTEUR_LABELS, type Capteur } from "@/lib/capteurs/types"

function formaterDate(valeur: string | null): string {
  if (!valeur) return "—"
  const date = new Date(valeur)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleString("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  })
}

export default function DispositifDetailPage() {
  const params = useParams<{ id: string }>()
  const id = Number(params.id)

  const [dispositif, setDispositif] = useState<Dispositif | null>(null)
  const [capteurs, setCapteurs] = useState<Capteur[]>([])
  const [loading, setLoading] = useState(true)
  const [erreur, setErreur] = useState<string | null>(null)

  useEffect(() => {
    let actif = true
    getDispositif(id)
      .then((d) => {
        if (!actif) return
        setDispositif(d)
        // Capteurs du dispositif (erreur non bloquante).
        getCapteursByDispositif(id)
          .then((cs) => {
            if (actif) setCapteurs(cs)
          })
          .catch(() => {})
      })
      .catch((e) => {
        if (actif)
          setErreur(
            e instanceof ApiError ? e.message : "Dispositif introuvable.",
          )
      })
      .finally(() => {
        if (actif) setLoading(false)
      })
    return () => {
      actif = false
    }
  }, [id])

  if (loading) {
    return (
      <div className="flex flex-col gap-4 p-4 md:p-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    )
  }

  if (erreur || !dispositif) {
    return (
      <div className="flex flex-col gap-4 p-4 md:p-6">
        <Button variant="outline" size="sm" asChild className="w-fit">
          <Link href="/dashboard/dispositifs">
            <ArrowLeftIcon className="size-4" />
            Retour aux dispositifs
          </Link>
        </Button>
        <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed p-8 text-sm text-muted-foreground">
          {erreur ?? "Dispositif introuvable."}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div className="flex flex-col gap-1">
          <Button variant="ghost" size="sm" asChild className="-ml-2 w-fit">
            <Link href="/dashboard/dispositifs">
              <ArrowLeftIcon className="size-4" />
              Dispositifs
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-semibold tracking-tight">
              {dispositif.nom}
            </h2>
            <Badge variant={STATUT_DISPOSITIF_BADGE[dispositif.statut]}>
              {STATUT_DISPOSITIF_LABELS[dispositif.statut]}
            </Badge>
          </div>
          <p className="font-mono text-sm text-muted-foreground">
            {dispositif.adresseMac}
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/dashboard/dispositifs/${dispositif.id}/modifier`}>
            <PencilIcon className="size-4" />
            Modifier
          </Link>
        </Button>
      </div>

      {/* Informations */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardDescription>Dispositif</CardDescription>
            <CardTitle className="text-lg">{dispositif.nom}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-1 text-sm">
            <Ligne libelle="Adresse MAC" valeur={dispositif.adresseMac} />
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Statut</span>
              <Badge variant={STATUT_DISPOSITIF_BADGE[dispositif.statut]}>
                {STATUT_DISPOSITIF_LABELS[dispositif.statut]}
              </Badge>
            </div>
            <Ligne libelle="Batterie" valeur={`${dispositif.batteriePct} %`} />
            <Ligne
              libelle="Dernier ping"
              valeur={formaterDate(dispositif.dernierePing)}
            />
            <Ligne
              libelle="Créé le"
              valeur={formaterDate(dispositif.dateCreation)}
            />
            {dispositif.description ? (
              <Ligne libelle="Description" valeur={dispositif.description} />
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Parcelle</CardDescription>
            <CardTitle className="text-lg">{dispositif.parcelleNom}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-1 text-sm">
            <Ligne
              libelle="Capteurs"
              valeur={`${capteurs.length} capteur(s)`}
            />
            <Button
              variant="link"
              size="sm"
              asChild
              className="h-auto w-fit p-0"
            >
              <Link href={`/dashboard/parcelles/${dispositif.parcelleId}`}>
                Voir la parcelle
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Liste des capteurs */}
      <div className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold tracking-tight">Capteurs</h3>
        {capteurs.length === 0 ? (
          <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed p-8 text-sm text-muted-foreground">
            Aucun capteur installé sur ce dispositif.
          </div>
        ) : (
          <div className="rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Plage</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {capteurs.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/dashboard/capteurs/${c.id}`}
                        className="hover:underline"
                      >
                        {c.nom}
                      </Link>
                      {c.modele ? (
                        <span className="block text-xs font-normal text-muted-foreground">
                          {c.modele}
                        </span>
                      ) : null}
                    </TableCell>
                    <TableCell>{TYPE_CAPTEUR_LABELS[c.type]}</TableCell>
                    <TableCell className="text-right tabular-nums whitespace-nowrap">
                      {c.valeurMin} – {c.valeurMax} {c.unite}
                    </TableCell>
                    <TableCell>
                      <Badge variant={c.actif ? "default" : "secondary"}>
                        {c.actif ? "Actif" : "Inactif"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
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
