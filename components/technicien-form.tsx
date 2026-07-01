"use client"

// Création d'un technicien (équipe AgriSmart), par le superviseur.
// Le rôle est fixé à TECHNICIEN ; le mot de passe est généré et envoyé par email.

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
import { ApiError } from "@/lib/api"
import { creerUtilisateur } from "@/lib/utilisateurs/utilisateur-service"

export function TechnicienForm({
  redirectTo = "/dashboard/techniciens",
}: {
  redirectTo?: string
}) {
  const router = useRouter()

  const [nom, setNom] = useState("")
  const [prenom, setPrenom] = useState("")
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting) return

    setIsSubmitting(true)
    try {
      const cree = await creerUtilisateur({
        nom: nom.trim(),
        prenom: prenom.trim(),
        email: email.trim(),
        role: "TECHNICIEN",
      })
      toast.success(
        `Technicien « ${cree.prenom} ${cree.nom} » créé. Ses identifiants lui ont été envoyés par email.`,
      )
      router.push(redirectTo)
      router.refresh()
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Création impossible. Vérifiez votre connexion réseau.",
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="prenom">Prénom</FieldLabel>
            <Input
              id="prenom"
              placeholder="Ex. Kodjo"
              required
              value={prenom}
              onChange={(e) => setPrenom(e.target.value)}
              disabled={isSubmitting}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="nom">Nom</FieldLabel>
            <Input
              id="nom"
              placeholder="Ex. Mensah"
              required
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              disabled={isSubmitting}
            />
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="email">E-mail</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="technicien@agrismart.tg"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
          />
          <FieldDescription>
            Un mot de passe sera généré et envoyé à cette adresse.
          </FieldDescription>
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
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Création…" : "Créer le technicien"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
