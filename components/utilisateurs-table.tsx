"use client"

// Tableau des utilisateurs de l'organisation, avec suppression confirmée.

import { useEffect, useState } from "react"
import { MoreHorizontal, Trash2 } from "lucide-react"
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
  getUtilisateurs,
  supprimerUtilisateur,
} from "@/lib/utilisateurs/utilisateur-service"
import { ROLE_LABELS, type Utilisateur } from "@/lib/utilisateurs/types"

export function UtilisateursTable() {
  const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [aSupprimer, setASupprimer] = useState<Utilisateur | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    let actif = true
    getUtilisateurs()
      .then((data) => {
        if (!actif) return
        setUtilisateurs(data)
        setError(null)
      })
      .catch((e) => {
        if (!actif) return
        setError(
          e instanceof ApiError
            ? e.message
            : "Impossible de charger les utilisateurs.",
        )
      })
      .finally(() => {
        if (actif) setIsLoading(false)
      })
    return () => {
      actif = false
    }
  }, [])

  function recharger() {
    setIsLoading(true)
    setError(null)
    getUtilisateurs()
      .then((data) => {
        setUtilisateurs(data)
        setError(null)
      })
      .catch((e) => {
        setError(
          e instanceof ApiError
            ? e.message
            : "Impossible de charger les utilisateurs.",
        )
      })
      .finally(() => setIsLoading(false))
  }

  async function confirmerSuppression() {
    if (!aSupprimer) return
    setIsDeleting(true)
    try {
      await supprimerUtilisateur(aSupprimer.id)
      toast.success(
        `Utilisateur « ${aSupprimer.prenom} ${aSupprimer.nom} » supprimé.`,
      )
      setUtilisateurs((prev) => prev.filter((u) => u.id !== aSupprimer.id))
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
        <Button variant="outline" size="sm" onClick={recharger}>
          Réessayer
        </Button>
      </div>
    )
  }

  if (utilisateurs.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed p-8 text-sm text-muted-foreground">
        Aucun utilisateur pour le moment.
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
              <TableHead>E-mail</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {utilisateurs.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">
                  {u.prenom} {u.nom}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {u.email}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{ROLE_LABELS[u.role]}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={u.actif ? "default" : "secondary"}>
                    {u.actif ? "Actif" : "Inactif"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        aria-label={`Actions pour ${u.prenom} ${u.nom}`}
                      >
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        variant="destructive"
                        onSelect={(e) => {
                          e.preventDefault()
                          setASupprimer(u)
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
            <AlertDialogTitle>Supprimer cet utilisateur ?</AlertDialogTitle>
            <AlertDialogDescription>
              {aSupprimer?.prenom} {aSupprimer?.nom} n&apos;aura plus accès à la
              plateforme. Cette action est irréversible.
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
