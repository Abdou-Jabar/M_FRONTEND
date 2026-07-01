"use client"

// Tableau des dispositifs avec actions (modifier / supprimer).
// Récupère les données via l'API, gère les états chargement / erreur / vide,
// et confirme la suppression via une boîte de dialogue.

import { useEffect, useState } from "react"
import Link from "next/link"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ApiError } from "@/lib/api"
import {
  getDispositifs,
  supprimerDispositif,
} from "@/lib/dispositifs/dispositif-service"
import {
  STATUT_DISPOSITIF_BADGE,
  STATUT_DISPOSITIF_LABELS,
  type Dispositif,
} from "@/lib/dispositifs/types"

function formaterPing(valeur: string | null): string {
  if (!valeur) return "—"
  const date = new Date(valeur)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleString("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  })
}

export function DispositifsTable() {
  const [dispositifs, setDispositifs] = useState<Dispositif[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [aSupprimer, setASupprimer] = useState<Dispositif | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Chargement initial : chaîne de promesse inline (aucun setState synchrone
  // dans le corps de l'effet).
  useEffect(() => {
    let actif = true
    getDispositifs()
      .then((data) => {
        if (!actif) return
        setDispositifs(data)
        setError(null)
      })
      .catch((e) => {
        if (!actif) return
        setError(
          e instanceof ApiError
            ? e.message
            : "Impossible de charger les dispositifs.",
        )
      })
      .finally(() => {
        if (actif) setIsLoading(false)
      })
    return () => {
      actif = false
    }
  }, [])

  // Rechargement manuel (bouton « Réessayer »), déclenché par un événement.
  function recharger() {
    setIsLoading(true)
    setError(null)
    getDispositifs()
      .then((data) => {
        setDispositifs(data)
        setError(null)
      })
      .catch((e) => {
        setError(
          e instanceof ApiError
            ? e.message
            : "Impossible de charger les dispositifs.",
        )
      })
      .finally(() => setIsLoading(false))
  }

  async function confirmerSuppression() {
    if (!aSupprimer) return
    setIsDeleting(true)
    try {
      await supprimerDispositif(aSupprimer.id)
      toast.success(`Dispositif « ${aSupprimer.nom} » supprimé.`)
      setDispositifs((prev) => prev.filter((d) => d.id !== aSupprimer.id))
      setASupprimer(null)
    } catch (e) {
      toast.error(
        e instanceof ApiError ? e.message : "Suppression impossible.",
      )
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-8 text-sm text-muted-foreground">
        <p>{error}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={recharger}
        >
          Réessayer
        </Button>
      </div>
    )
  }

  if (dispositifs.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed p-8 text-sm text-muted-foreground">
        Aucun dispositif pour le moment.
      </div>
    )
  }

  return (
    <>
      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Parcelle</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Batterie</TableHead>
              <TableHead>Dernier ping</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {dispositifs.map((d) => (
              <TableRow key={d.id}>
                <TableCell className="font-medium">
                  <Link
                    href={`/dashboard/dispositifs/${d.id}`}
                    className="hover:underline"
                  >
                    {d.nom}
                  </Link>
                  <span className="block font-mono text-xs font-normal text-muted-foreground">
                    {d.adresseMac}
                  </span>
                </TableCell>
                <TableCell>{d.parcelleNom}</TableCell>
                <TableCell>
                  <Badge variant={STATUT_DISPOSITIF_BADGE[d.statut]}>
                    {STATUT_DISPOSITIF_LABELS[d.statut]}
                  </Badge>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {d.batteriePct} %
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formaterPing(d.dernierePing)}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        aria-label={`Actions pour ${d.nom}`}
                      >
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/dispositifs/${d.id}/modifier`}>
                          <Pencil className="size-4" />
                          Modifier
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        variant="destructive"
                        onSelect={(e) => {
                          e.preventDefault()
                          setASupprimer(d)
                        }}
                      >
                        <Trash2 className="size-4" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog
        open={aSupprimer !== null}
        onOpenChange={(open) => {
          if (!open && !isDeleting) setASupprimer(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce dispositif ?</AlertDialogTitle>
            <AlertDialogDescription>
              Le dispositif « {aSupprimer?.nom} » sera supprimé. Cette action
              est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                confirmerSuppression()
              }}
              disabled={isDeleting}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {isDeleting ? "Suppression…" : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
