"use client"

// Formulaire de création / édition d'un dispositif.
// - Sans prop `dispositif` : mode création (POST).
// - Avec un `dispositif` initial : mode édition (PUT).
//
// La parcelle de rattachement est choisie via une liste déroulante alimentée
// par l'API des parcelles.

import { useEffect, useState } from "react"
import Link from "next/link"
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
  creerDispositif,
  modifierDispositif,
} from "@/lib/dispositifs/dispositif-service"
import type { Dispositif, DispositifRequest } from "@/lib/dispositifs/types"
import { getParcelles } from "@/lib/parcelles/parcelle-service"
import type { Parcelle } from "@/lib/parcelles/types"

export function DispositifForm({
  dispositif,
  redirectTo = "/dashboard/dispositifs",
  parcelles: parcellesInjectees,
  onSuccess,
}: {
  dispositif?: Dispositif
  redirectTo?: string
  // Liste de parcelles injectée : si fournie, le formulaire ne fait pas d'appel
  // réseau (utile pour le flux d'installation où la parcelle est déjà connue).
  parcelles?: Parcelle[]
  // Callback appelé après une création/édition réussie. S'il est fourni, on ne
  // redirige pas (on reste sur la page) et on réinitialise le formulaire.
  onSuccess?: (dispositif: Dispositif) => void
}) {
  const router = useRouter()
  const isEdit = Boolean(dispositif)
  const parcellesFournies = parcellesInjectees !== undefined

  const [nom, setNom] = useState(dispositif?.nom ?? "")
  const [adresseMac, setAdresseMac] = useState(dispositif?.adresseMac ?? "")
  const [description, setDescription] = useState(dispositif?.description ?? "")
  const [parcelleId, setParcelleId] = useState<string>(
    dispositif?.parcelleId != null
      ? String(dispositif.parcelleId)
      : parcellesInjectees?.length === 1
        ? String(parcellesInjectees[0].id)
        : "",
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Liste des parcelles pour le select.
  const [parcelles, setParcelles] = useState<Parcelle[]>(
    parcellesInjectees ?? [],
  )
  const [parcellesLoading, setParcellesLoading] = useState(!parcellesFournies)
  const [parcellesError, setParcellesError] = useState<string | null>(null)

  useEffect(() => {
    // Parcelles injectées : aucun appel réseau nécessaire.
    if (parcellesFournies) return
    let actif = true
    getParcelles()
      .then((data) => {
        if (actif) setParcelles(data)
      })
      .catch((e) => {
        if (actif)
          setParcellesError(
            e instanceof ApiError
              ? e.message
              : "Impossible de charger les parcelles.",
          )
      })
      .finally(() => {
        if (actif) setParcellesLoading(false)
      })
    return () => {
      actif = false
    }
  }, [parcellesFournies])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting) return

    if (!parcelleId) {
      toast.error("Veuillez sélectionner une parcelle.")
      return
    }

    const payload: DispositifRequest = {
      nom: nom.trim(),
      adresseMac: adresseMac.trim(),
      description: description.trim() || undefined,
      parcelleId: Number(parcelleId),
    }

    setIsSubmitting(true)
    try {
      if (isEdit && dispositif) {
        const maj = await modifierDispositif(dispositif.id, payload)
        toast.success(`Dispositif « ${payload.nom} » mis à jour.`)
        if (onSuccess) {
          onSuccess(maj)
          return
        }
      } else {
        const cree = await creerDispositif(payload)
        toast.success(`Dispositif « ${cree.nom} » créé avec succès.`)
        if (onSuccess) {
          // On reste sur la page : on réinitialise pour permettre un ajout en série.
          setNom("")
          setAdresseMac("")
          setDescription("")
          if (parcellesInjectees && parcellesInjectees.length !== 1) {
            setParcelleId("")
          }
          onSuccess(cree)
          return
        }
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

  // Aucune parcelle disponible : on ne peut pas rattacher de dispositif.
  if (!parcellesLoading && !parcellesError && parcelles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
        <p>
          Aucune parcelle n&apos;est disponible. Créez d&apos;abord une parcelle
          pour pouvoir y rattacher un dispositif.
        </p>
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard/parcelles/nouvelle">Créer une parcelle</Link>
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="nom">Nom du dispositif</FieldLabel>
          <Input
            id="nom"
            name="nom"
            placeholder="Ex. Station Nord"
            required
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            disabled={isSubmitting}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="adresseMac">Adresse MAC</FieldLabel>
          <Input
            id="adresseMac"
            name="adresseMac"
            placeholder="Ex. A4:CF:12:34:56:78"
            required
            value={adresseMac}
            onChange={(e) => setAdresseMac(e.target.value)}
            disabled={isSubmitting}
          />
          <FieldDescription>
            Identifiant matériel unique du dispositif.
          </FieldDescription>
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
        </Field>

        <Field>
          <FieldLabel htmlFor="parcelle">Parcelle</FieldLabel>
          <Select
            value={parcelleId}
            onValueChange={setParcelleId}
            disabled={isSubmitting || parcellesLoading || !!parcellesError}
          >
            <SelectTrigger id="parcelle" className="w-full">
              <SelectValue
                placeholder={
                  parcellesLoading
                    ? "Chargement des parcelles…"
                    : "Sélectionner une parcelle"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {parcelles.map((p) => (
                <SelectItem key={p.id} value={String(p.id)}>
                  {p.nom}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {parcellesError ? (
            <FieldDescription className="text-destructive">
              {parcellesError}
            </FieldDescription>
          ) : null}
        </Field>

        <Field orientation="horizontal" className="justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(redirectTo)}
            disabled={isSubmitting}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={isSubmitting || parcellesLoading}>
            {isSubmitting
              ? "Enregistrement…"
              : isEdit
                ? "Enregistrer les modifications"
                : "Créer le dispositif"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
