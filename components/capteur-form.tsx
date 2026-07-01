"use client"

// Formulaire de création / édition d'un capteur.
// - Sans prop `capteur` : mode création (POST).
// - Avec un `capteur` initial : mode édition (PUT).
//
// Le type est choisi via une liste déroulante (et pré-remplit l'unité), et le
// dispositif de rattachement via une liste alimentée par l'API des dispositifs.

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
  creerCapteur,
  modifierCapteur,
} from "@/lib/capteurs/capteur-service"
import {
  TYPE_CAPTEUR_OPTIONS,
  UNITE_PAR_DEFAUT,
  type Capteur,
  type CapteurRequest,
  type TypeCapteur,
} from "@/lib/capteurs/types"
import { getDispositifs } from "@/lib/dispositifs/dispositif-service"
import type { Dispositif } from "@/lib/dispositifs/types"

export function CapteurForm({
  capteur,
  redirectTo = "/dashboard/capteurs",
  dispositifs: dispositifsInjectes,
  onSuccess,
}: {
  capteur?: Capteur
  redirectTo?: string
  // Liste de dispositifs injectée : si fournie, pas d'appel réseau.
  dispositifs?: Dispositif[]
  // Callback après succès : s'il est fourni, on reste sur la page.
  onSuccess?: (capteur: Capteur) => void
}) {
  const router = useRouter()
  const isEdit = Boolean(capteur)
  const dispositifsFournis = dispositifsInjectes !== undefined

  const [nom, setNom] = useState(capteur?.nom ?? "")
  const [type, setType] = useState<TypeCapteur | "">(capteur?.type ?? "")
  const [modele, setModele] = useState(capteur?.modele ?? "")
  const [unite, setUnite] = useState(capteur?.unite ?? "")
  const [valeurMin, setValeurMin] = useState(
    capteur?.valeurMin != null ? String(capteur.valeurMin) : "",
  )
  const [valeurMax, setValeurMax] = useState(
    capteur?.valeurMax != null ? String(capteur.valeurMax) : "",
  )
  const [dispositifId, setDispositifId] = useState<string>(
    capteur?.dispositifId != null
      ? String(capteur.dispositifId)
      : dispositifsInjectes?.length === 1
        ? String(dispositifsInjectes[0].id)
        : "",
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [dispositifs, setDispositifs] = useState<Dispositif[]>(
    dispositifsInjectes ?? [],
  )
  const [dispositifsLoading, setDispositifsLoading] = useState(
    !dispositifsFournis,
  )
  const [dispositifsError, setDispositifsError] = useState<string | null>(null)

  useEffect(() => {
    if (dispositifsFournis) return
    let actif = true
    getDispositifs()
      .then((data) => {
        if (actif) setDispositifs(data)
      })
      .catch((e) => {
        if (actif)
          setDispositifsError(
            e instanceof ApiError
              ? e.message
              : "Impossible de charger les dispositifs.",
          )
      })
      .finally(() => {
        if (actif) setDispositifsLoading(false)
      })
    return () => {
      actif = false
    }
  }, [dispositifsFournis])

  // Sélection du type : pré-remplit l'unité si elle est encore vide.
  function handleTypeChange(value: TypeCapteur) {
    setType(value)
    if (!unite.trim()) {
      setUnite(UNITE_PAR_DEFAUT[value])
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting) return

    if (!type) {
      toast.error("Veuillez sélectionner un type de capteur.")
      return
    }
    if (!dispositifId) {
      toast.error("Veuillez sélectionner un dispositif.")
      return
    }

    const minNum = Number(valeurMin)
    const maxNum = Number(valeurMax)

    if (Number.isNaN(minNum) || Number.isNaN(maxNum)) {
      toast.error("Les valeurs min et max doivent être des nombres.")
      return
    }
    if (minNum >= maxNum) {
      toast.error("La valeur minimale doit être inférieure à la maximale.")
      return
    }

    const payload: CapteurRequest = {
      nom: nom.trim(),
      type,
      modele: modele.trim() || undefined,
      unite: unite.trim(),
      valeurMin: minNum,
      valeurMax: maxNum,
      dispositifId: Number(dispositifId),
    }

    setIsSubmitting(true)
    try {
      if (isEdit && capteur) {
        const maj = await modifierCapteur(capteur.id, payload)
        toast.success(`Capteur « ${payload.nom} » mis à jour.`)
        if (onSuccess) {
          onSuccess(maj)
          return
        }
      } else {
        const cree = await creerCapteur(payload)
        toast.success(`Capteur « ${cree.nom} » créé avec succès.`)
        if (onSuccess) {
          // On reste sur la page : réinitialisation pour un ajout en série.
          setNom("")
          setType("")
          setModele("")
          setUnite("")
          setValeurMin("")
          setValeurMax("")
          if (dispositifsInjectes && dispositifsInjectes.length !== 1) {
            setDispositifId("")
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

  // En création, impossible de rattacher un capteur sans dispositif.
  if (
    !isEdit &&
    !dispositifsLoading &&
    !dispositifsError &&
    dispositifs.length === 0
  ) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
        <p>
          Aucun dispositif n&apos;est disponible. Créez d&apos;abord un
          dispositif pour pouvoir y rattacher un capteur.
        </p>
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard/dispositifs/nouveau">Créer un dispositif</Link>
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="nom">Nom du capteur</FieldLabel>
          <Input
            id="nom"
            name="nom"
            placeholder="Ex. Sonde humidité sol"
            required
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            disabled={isSubmitting}
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="type">Type</FieldLabel>
            <Select
              value={type}
              onValueChange={(v) => handleTypeChange(v as TypeCapteur)}
              disabled={isSubmitting}
            >
              <SelectTrigger id="type" className="w-full">
                <SelectValue placeholder="Sélectionner un type" />
              </SelectTrigger>
              <SelectContent>
                {TYPE_CAPTEUR_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel htmlFor="unite">Unité</FieldLabel>
            <Input
              id="unite"
              name="unite"
              placeholder="Ex. °C, %, lux"
              required
              value={unite}
              onChange={(e) => setUnite(e.target.value)}
              disabled={isSubmitting}
            />
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="modele">Modèle</FieldLabel>
          <Input
            id="modele"
            name="modele"
            placeholder="Optionnel (ex. DHT22)"
            value={modele}
            onChange={(e) => setModele(e.target.value)}
            disabled={isSubmitting}
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="valeurMin">Valeur minimale</FieldLabel>
            <Input
              id="valeurMin"
              name="valeurMin"
              type="number"
              step="any"
              placeholder="Ex. 0"
              required
              value={valeurMin}
              onChange={(e) => setValeurMin(e.target.value)}
              disabled={isSubmitting}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="valeurMax">Valeur maximale</FieldLabel>
            <Input
              id="valeurMax"
              name="valeurMax"
              type="number"
              step="any"
              placeholder="Ex. 100"
              required
              value={valeurMax}
              onChange={(e) => setValeurMax(e.target.value)}
              disabled={isSubmitting}
            />
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="dispositif">Dispositif</FieldLabel>
          <Select
            value={dispositifId}
            onValueChange={setDispositifId}
            disabled={
              isSubmitting || dispositifsLoading || !!dispositifsError || isEdit
            }
          >
            <SelectTrigger id="dispositif" className="w-full">
              <SelectValue
                placeholder={
                  dispositifsLoading
                    ? "Chargement des dispositifs…"
                    : "Sélectionner un dispositif"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {dispositifs.map((d) => (
                <SelectItem key={d.id} value={String(d.id)}>
                  {d.nom} — {d.parcelleNom}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {dispositifsError ? (
            <FieldDescription className="text-destructive">
              {dispositifsError}
            </FieldDescription>
          ) : isEdit ? (
            <FieldDescription>
              Le dispositif de rattachement n&apos;est pas modifiable.
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
          <Button type="submit" disabled={isSubmitting || dispositifsLoading}>
            {isSubmitting
              ? "Enregistrement…"
              : isEdit
                ? "Enregistrer les modifications"
                : "Créer le capteur"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
