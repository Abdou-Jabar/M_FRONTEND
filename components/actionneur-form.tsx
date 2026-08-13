"use client"

// Formulaire de création d'un actionneur (flux d'installation technicien).
// Champs : nom, type, dispositif de rattachement (verrouillé s'il est unique).
// Reste sur la page après succès pour permettre un ajout en série.

import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ApiError } from "@/lib/api"
import { creerActionneur } from "@/lib/actionneurs/actionneur-service"
import {
  TYPE_ACTIONNEUR_LABELS,
  type Actionneur,
  type TypeActionneur,
} from "@/lib/actionneurs/types"
import type { Dispositif } from "@/lib/dispositifs/types"

const TYPE_OPTIONS = Object.entries(TYPE_ACTIONNEUR_LABELS) as [
  TypeActionneur,
  string,
][]

export function ActionneurForm({
  dispositifs,
  onSuccess,
}: {
  // Dispositifs candidats au rattachement (souvent un seul, injecté).
  dispositifs: Dispositif[]
  // Callback après création réussie (le formulaire se réinitialise).
  onSuccess?: (actionneur: Actionneur) => void
}) {
  const [nom, setNom] = useState("")
  const [type, setType] = useState<TypeActionneur | "">("")
  const [dispositifId, setDispositifId] = useState<string>(
    dispositifs.length === 1 ? String(dispositifs[0].id) : "",
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting) return

    if (!type) {
      toast.error("Veuillez sélectionner un type d'actionneur.")
      return
    }
    if (!dispositifId) {
      toast.error("Veuillez sélectionner un dispositif.")
      return
    }

    setIsSubmitting(true)
    try {
      const cree = await creerActionneur({
        nom: nom.trim(),
        type,
        dispositifId: Number(dispositifId),
      })
      toast.success(`Actionneur « ${cree.nom} » installé.`)
      // Réinitialisation pour un ajout en série.
      setNom("")
      setType("")
      onSuccess?.(cree)
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
          <FieldLabel htmlFor="actionneur-nom">
            Nom de l&apos;actionneur
          </FieldLabel>
          <Input
            id="actionneur-nom"
            name="nom"
            placeholder="Ex. Pompe à eau nord"
            required
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            disabled={isSubmitting}
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="actionneur-type">Type</FieldLabel>
            <Select
              value={type}
              onValueChange={(v) => setType(v as TypeActionneur)}
              disabled={isSubmitting}
            >
              <SelectTrigger id="actionneur-type" className="w-full">
                <SelectValue placeholder="Sélectionner un type" />
              </SelectTrigger>
              <SelectContent>
                {TYPE_OPTIONS.map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel htmlFor="actionneur-dispositif">Dispositif</FieldLabel>
            <Select
              value={dispositifId}
              onValueChange={setDispositifId}
              disabled={isSubmitting || dispositifs.length === 1}
            >
              <SelectTrigger id="actionneur-dispositif" className="w-full">
                <SelectValue placeholder="Sélectionner un dispositif" />
              </SelectTrigger>
              <SelectContent>
                {dispositifs.map((d) => (
                  <SelectItem key={d.id} value={String(d.id)}>
                    {d.nom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Installation…" : "Installer l'actionneur"}
        </Button>
      </FieldGroup>
    </form>
  )
}
