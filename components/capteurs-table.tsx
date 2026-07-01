"use client"

// Tableau des capteurs (vue agrégée de tous les dispositifs) avec actions
// modifier / activer / désactiver / supprimer.

import { useEffect, useState } from "react"
import Link from "next/link"
import { MoreHorizontal, Pencil, Power, PowerOff, Trash2 } from "lucide-react"
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
  activerCapteur,
  desactiverCapteur,
  getAllCapteurs,
  supprimerCapteur,
} from "@/lib/capteurs/capteur-service"
import { TYPE_CAPTEUR_LABELS, type Capteur } from "@/lib/capteurs/types"

export function CapteursTable() {
  const [capteurs, setCapteurs] = useState<Capteur[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [aSupprimer, setASupprimer] = useState<Capteur | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Chargement initial : chaîne de promesse inline (aucun setState synchrone
  // dans le corps de l'effet).
  useEffect(() => {
    let actif = true
    getAllCapteurs()
      .then((data) => {
        if (!actif) return
        setCapteurs(data)
        setError(null)
      })
      .catch((e) => {
        if (!actif) return
        setError(
          e instanceof ApiError
            ? e.message
            : "Impossible de charger les capteurs.",
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
    getAllCapteurs()
      .then((data) => {
        setCapteurs(data)
        setError(null)
      })
      .catch((e) => {
        setError(
          e instanceof ApiError
            ? e.message
            : "Impossible de charger les capteurs.",
        )
      })
      .finally(() => setIsLoading(false))
  }

  async function basculerActivation(capteur: Capteur) {
    try {
      const maj = capteur.actif
        ? await desactiverCapteur(capteur.id)
        : await activerCapteur(capteur.id)
      setCapteurs((prev) => prev.map((c) => (c.id === maj.id ? maj : c)))
      toast.success(
        maj.actif
          ? `Capteur « ${maj.nom} » activé.`
          : `Capteur « ${maj.nom} » désactivé.`,
      )
    } catch (e) {
      toast.error(
        e instanceof ApiError ? e.message : "Opération impossible.",
      )
    }
  }

  async function confirmerSuppression() {
    if (!aSupprimer) return
    setIsDeleting(true)
    try {
      await supprimerCapteur(aSupprimer.id)
      toast.success(`Capteur « ${aSupprimer.nom} » supprimé.`)
      setCapteurs((prev) => prev.filter((c) => c.id !== aSupprimer.id))
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

  if (capteurs.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed p-8 text-sm text-muted-foreground">
        Aucun capteur pour le moment.
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
              <TableHead>Type</TableHead>
              <TableHead>Dispositif</TableHead>
              <TableHead>Parcelle</TableHead>
              <TableHead className="text-right">Plage</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="w-12" />
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
                <TableCell>{c.dispositifNom}</TableCell>
                <TableCell>{c.parcelleNom}</TableCell>
                <TableCell className="text-right tabular-nums whitespace-nowrap">
                  {c.valeurMin} – {c.valeurMax} {c.unite}
                </TableCell>
                <TableCell>
                  <Badge variant={c.actif ? "default" : "secondary"}>
                    {c.actif ? "Actif" : "Inactif"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        aria-label={`Actions pour ${c.nom}`}
                      >
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/capteurs/${c.id}/modifier`}>
                          <Pencil className="size-4" />
                          Modifier
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={(e) => {
                          e.preventDefault()
                          basculerActivation(c)
                        }}
                      >
                        {c.actif ? (
                          <>
                            <PowerOff className="size-4" />
                            Désactiver
                          </>
                        ) : (
                          <>
                            <Power className="size-4" />
                            Activer
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        variant="destructive"
                        onSelect={(e) => {
                          e.preventDefault()
                          setASupprimer(c)
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
            <AlertDialogTitle>Supprimer ce capteur ?</AlertDialogTitle>
            <AlertDialogDescription>
              Le capteur « {aSupprimer?.nom} » sera supprimé. Cette action est
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
