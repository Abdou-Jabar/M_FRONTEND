"use client"

// Tableau des parcelles avec actions (modifier / supprimer).
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
  getParcelles,
  supprimerParcelle,
} from "@/lib/parcelles/parcelle-service"
import {
  ENVIRONNEMENT_LABELS,
  TYPE_SOL_LABELS,
  type Parcelle,
} from "@/lib/parcelles/types"

export function ParcellesTable() {
  const [parcelles, setParcelles] = useState<Parcelle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Parcelle en attente de confirmation de suppression.
  const [aSupprimer, setASupprimer] = useState<Parcelle | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Chargement initial : chaîne de promesse inline (aucun setState synchrone
  // dans le corps de l'effet).
  useEffect(() => {
    let actif = true
    getParcelles()
      .then((data) => {
        if (!actif) return
        setParcelles(data)
        setError(null)
      })
      .catch((e) => {
        if (!actif) return
        setError(
          e instanceof ApiError
            ? e.message
            : "Impossible de charger les parcelles.",
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
    getParcelles()
      .then((data) => {
        setParcelles(data)
        setError(null)
      })
      .catch((e) => {
        setError(
          e instanceof ApiError
            ? e.message
            : "Impossible de charger les parcelles.",
        )
      })
      .finally(() => setIsLoading(false))
  }

  async function confirmerSuppression() {
    if (!aSupprimer) return
    setIsDeleting(true)
    try {
      await supprimerParcelle(aSupprimer.id)
      toast.success(`Parcelle « ${aSupprimer.nom} » supprimée.`)
      setParcelles((prev) => prev.filter((p) => p.id !== aSupprimer.id))
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

  if (parcelles.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed p-8 text-sm text-muted-foreground">
        Aucune parcelle pour le moment.
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
              <TableHead>Type de sol</TableHead>
              <TableHead>Environnement</TableHead>
              <TableHead className="text-right">Superficie (m²)</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {parcelles.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">
                  <Link
                    href={`/dashboard/parcelles/${p.id}`}
                    className="hover:underline"
                  >
                    {p.nom}
                  </Link>
                  {p.description ? (
                    <span className="block text-xs font-normal text-muted-foreground">
                      {p.description}
                    </span>
                  ) : null}
                </TableCell>
                <TableCell>{TYPE_SOL_LABELS[p.typeSol]}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      p.environnement === "CONTROLE" ? "default" : "secondary"
                    }
                  >
                    {ENVIRONNEMENT_LABELS[p.environnement]}
                  </Badge>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {p.superficie.toLocaleString("fr-FR")}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        aria-label={`Actions pour ${p.nom}`}
                      >
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/parcelles/${p.id}/modifier`}>
                          <Pencil className="size-4" />
                          Modifier
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        variant="destructive"
                        onSelect={(e) => {
                          e.preventDefault()
                          setASupprimer(p)
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
            <AlertDialogTitle>Supprimer cette parcelle ?</AlertDialogTitle>
            <AlertDialogDescription>
              La parcelle « {aSupprimer?.nom} » sera supprimée. Cette action est
              irréversible.
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
