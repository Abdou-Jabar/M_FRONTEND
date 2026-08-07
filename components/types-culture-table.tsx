"use client"

// Gestion du catalogue des types de culture (superviseur).
// CRUD complet : création/édition via Sheet, suppression via AlertDialog.

import { useEffect, useState } from "react"
import { MoreHorizontal, PencilIcon, Plus, RefreshCwIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ApiError } from "@/lib/api"
import {
  creerTypeCulture,
  getTypesCulture,
  modifierTypeCulture,
  supprimerTypeCulture,
} from "@/lib/types-culture/type-culture-service"
import type { TypeCulture } from "@/lib/types-culture/types"

export function TypesCultureTable({
  onChanged,
}: {
  // Notifie le parent (ex. onglet seuils) qu'il faut rafraîchir le catalogue.
  onChanged?: () => void
}) {
  const [types, setTypes] = useState<TypeCulture[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Sheet création/édition
  const [sheetOuvert, setSheetOuvert] = useState(false)
  const [typeEnEdition, setTypeEnEdition] = useState<TypeCulture | null>(null)
  const [nom, setNom] = useState("")
  const [variete, setVariete] = useState("")
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Suppression
  const [typeASupprimer, setTypeASupprimer] = useState<TypeCulture | null>(null)

  function charger() {
    setIsLoading(true)
    setError(null)
    getTypesCulture()
      .then((data) => setTypes(data))
      .catch((e) =>
        setError(
          e instanceof ApiError
            ? e.message
            : "Impossible de charger les types de culture.",
        ),
      )
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    let actif = true
    getTypesCulture()
      .then((data) => { if (actif) setTypes(data) })
      .catch((e) => {
        if (!actif) return
        setError(
          e instanceof ApiError
            ? e.message
            : "Impossible de charger les types de culture.",
        )
      })
      .finally(() => { if (actif) setIsLoading(false) })
    return () => { actif = false }
  }, [])

  function ouvrirCreation() {
    setTypeEnEdition(null)
    setNom("")
    setVariete("")
    setDescription("")
    setSheetOuvert(true)
  }

  function ouvrirEdition(type: TypeCulture) {
    setTypeEnEdition(type)
    setNom(type.nom)
    setVariete(type.variete)
    setDescription(type.description)
    setSheetOuvert(true)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (isSubmitting) return

    setIsSubmitting(true)
    try {
      const payload = {
        nom: nom.trim(),
        variete: variete.trim(),
        description: description.trim(),
      }
      if (typeEnEdition) {
        const maj = await modifierTypeCulture(typeEnEdition.id, payload)
        setTypes((prev) => prev.map((t) => (t.id === maj.id ? maj : t)))
        toast.success(`Type de culture « ${maj.nom} » modifié.`)
      } else {
        const cree = await creerTypeCulture(payload)
        setTypes((prev) => [...prev, cree])
        toast.success(`Type de culture « ${cree.nom} » créé.`)
      }
      setSheetOuvert(false)
      onChanged?.()
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : "Opération impossible.",
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleSupprimer() {
    if (!typeASupprimer) return
    try {
      await supprimerTypeCulture(typeASupprimer.id)
      setTypes((prev) => prev.filter((t) => t.id !== typeASupprimer.id))
      toast.success(`Type de culture « ${typeASupprimer.nom} » supprimé.`)
      onChanged?.()
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : "Suppression impossible.",
      )
    } finally {
      setTypeASupprimer(null)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end">
        <Button size="sm" onClick={ouvrirCreation}>
          <Plus className="size-4" />
          Nouveau type de culture
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-10 text-sm text-muted-foreground">
          <p>{error}</p>
          <Button variant="outline" size="sm" onClick={charger}>
            <RefreshCwIcon className="size-4" />
            Réessayer
          </Button>
        </div>
      ) : types.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-10 text-sm text-muted-foreground">
          <p>Aucun type de culture dans le catalogue.</p>
          <Button size="sm" variant="outline" onClick={ouvrirCreation}>
            <Plus className="size-4" />
            Créer le premier type
          </Button>
        </div>
      ) : (
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Variété</TableHead>
                <TableHead className="hidden md:table-cell">Description</TableHead>
                <TableHead>Seuils</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {types.map((type) => (
                <TableRow key={type.id}>
                  <TableCell className="font-medium">{type.nom}</TableCell>
                  <TableCell>{type.variete}</TableCell>
                  <TableCell className="hidden max-w-md truncate text-muted-foreground md:table-cell">
                    {type.description}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {type.seuils?.length ?? 0}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onSelect={(e) => {
                            e.preventDefault()
                            ouvrirEdition(type)
                          }}
                        >
                          <PencilIcon className="size-4" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onSelect={(e) => {
                            e.preventDefault()
                            setTypeASupprimer(type)
                          }}
                        >
                          <Trash2Icon className="size-4" />
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
      )}

      {/* Sheet création / édition */}
      <Sheet open={sheetOuvert} onOpenChange={setSheetOuvert}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>
              {typeEnEdition
                ? `Modifier « ${typeEnEdition.nom} »`
                : "Nouveau type de culture"}
            </SheetTitle>
            <SheetDescription>
              Le catalogue est partagé par toutes les organisations.
            </SheetDescription>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="flex flex-1 flex-col px-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="tc-nom">Nom</FieldLabel>
                <Input
                  id="tc-nom"
                  placeholder="Ex. Tomate"
                  required
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  disabled={isSubmitting}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="tc-variete">Variété</FieldLabel>
                <Input
                  id="tc-variete"
                  placeholder="Ex. Roma"
                  required
                  value={variete}
                  onChange={(e) => setVariete(e.target.value)}
                  disabled={isSubmitting}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="tc-description">Description</FieldLabel>
                <Input
                  id="tc-description"
                  placeholder="Courte description"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isSubmitting}
                />
              </Field>
            </FieldGroup>
            <SheetFooter className="mt-auto px-0">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Enregistrement…"
                  : typeEnEdition
                    ? "Enregistrer"
                    : "Créer"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setSheetOuvert(false)}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      {/* Confirmation suppression */}
      <AlertDialog
        open={typeASupprimer !== null}
        onOpenChange={(open) => { if (!open) setTypeASupprimer(null) }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce type de culture ?</AlertDialogTitle>
            <AlertDialogDescription>
              « {typeASupprimer?.nom} ({typeASupprimer?.variete}) » et ses
              seuils associés ne seront plus proposés aux organisations. La
              suppression est refusée si des cultures en cours l&apos;utilisent.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleSupprimer}>
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
