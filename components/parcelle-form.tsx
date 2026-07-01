"use client"

// Formulaire de création / édition d'une parcelle.
// - Sans prop `parcelle` : mode création (POST).
// - Avec une `parcelle` initiale : mode édition (PUT).

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ApiError } from "@/lib/api"
import {
  creerParcelle,
  modifierParcelle,
} from "@/lib/parcelles/parcelle-service"
import {
  ENVIRONNEMENT_OPTIONS,
  TYPE_SOL_OPTIONS,
  type Environnement,
  type Parcelle,
  type ParcelleRequest,
  type TypeSol,
} from "@/lib/parcelles/types"

export function ParcelleForm({
  parcelle,
  redirectTo = "/dashboard/parcelles",
}: {
  parcelle?: Parcelle
  redirectTo?: string
}) {
  const router = useRouter()
  const isEdit = Boolean(parcelle)

  const [nom, setNom] = useState(parcelle?.nom ?? "")
  const [description, setDescription] = useState(parcelle?.description ?? "")
  const [superficie, setSuperficie] = useState(
    parcelle?.superficie != null ? String(parcelle.superficie) : "",
  )
  const [latitude, setLatitude] = useState(
    parcelle?.latitude != null ? String(parcelle.latitude) : "",
  )
  const [longitude, setLongitude] = useState(
    parcelle?.longitude != null ? String(parcelle.longitude) : "",
  )
  const [typeSol, setTypeSol] = useState<TypeSol | "">(parcelle?.typeSol ?? "")
  const [environnement, setEnvironnement] = useState<Environnement | "">(
    parcelle?.environnement ?? "",
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting) return

    if (!typeSol) {
      toast.error("Veuillez sélectionner un type de sol.")
      return
    }
    if (!environnement) {
      toast.error("Veuillez sélectionner un environnement.")
      return
    }

    const superficieNum = Number(superficie)
    const latitudeNum = Number(latitude)
    const longitudeNum = Number(longitude)

    if (Number.isNaN(superficieNum) || superficieNum <= 0) {
      toast.error("La superficie doit être un nombre supérieur à 0.")
      return
    }
    if (Number.isNaN(latitudeNum) || Number.isNaN(longitudeNum)) {
      toast.error("La latitude et la longitude doivent être des nombres.")
      return
    }

    const payload: ParcelleRequest = {
      nom: nom.trim(),
      description: description.trim() || undefined,
      superficie: superficieNum,
      latitude: latitudeNum,
      longitude: longitudeNum,
      typeSol,
      environnement,
    }

    setIsSubmitting(true)
    try {
      if (isEdit && parcelle) {
        await modifierParcelle(parcelle.id, payload)
        toast.success(`Parcelle « ${payload.nom} » mise à jour.`)
      } else {
        const creee = await creerParcelle(payload)
        toast.success(`Parcelle « ${creee.nom} » créée avec succès.`)
      }
      router.push(redirectTo)
      router.refresh()
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Opération impossible. Vérifiez votre connexion réseau."
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="nom">Nom de la parcelle</FieldLabel>
          <Input
            id="nom"
            name="nom"
            placeholder="Ex. Parcelle Nord"
            required
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            disabled={isSubmitting}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="description">Description</FieldLabel>
          <Input
            id="description"
            name="description"
            placeholder="Optionnel"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isSubmitting}
          />
          <FieldDescription>
            Une courte description de la parcelle (facultatif).
          </FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor="superficie">Superficie (m²)</FieldLabel>
          <Input
            id="superficie"
            name="superficie"
            type="number"
            step="0.01"
            min="0"
            placeholder="Ex. 1500"
            required
            value={superficie}
            onChange={(e) => setSuperficie(e.target.value)}
            disabled={isSubmitting}
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="latitude">Latitude</FieldLabel>
            <Input
              id="latitude"
              name="latitude"
              type="number"
              step="any"
              placeholder="Ex. 6.3703"
              required
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              disabled={isSubmitting}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="longitude">Longitude</FieldLabel>
            <Input
              id="longitude"
              name="longitude"
              type="number"
              step="any"
              placeholder="Ex. 2.3912"
              required
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              disabled={isSubmitting}
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="typeSol">Type de sol</FieldLabel>
            <Select
              value={typeSol}
              onValueChange={(v) => setTypeSol(v as TypeSol)}
              disabled={isSubmitting}
            >
              <SelectTrigger id="typeSol" className="w-full">
                <SelectValue placeholder="Sélectionner un type de sol" />
              </SelectTrigger>
              <SelectContent>
                {TYPE_SOL_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel htmlFor="environnement">Environnement</FieldLabel>
            <Select
              value={environnement}
              onValueChange={(v) => setEnvironnement(v as Environnement)}
              disabled={isSubmitting}
            >
              <SelectTrigger id="environnement" className="w-full">
                <SelectValue placeholder="Sélectionner un environnement" />
              </SelectTrigger>
              <SelectContent>
                {ENVIRONNEMENT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        <Field orientation="horizontal" className="justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(redirectTo)}
            disabled={isSubmitting}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Enregistrement…"
              : isEdit
                ? "Enregistrer les modifications"
                : "Créer la parcelle"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
