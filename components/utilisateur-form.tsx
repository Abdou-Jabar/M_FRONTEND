"use client"

// Formulaire de création d'un utilisateur par l'ADMIN d'une organisation.
// Le mot de passe est généré côté backend et envoyé par email à l'utilisateur.

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
import type { Role } from "@/lib/auth/types"
import { creerUtilisateur } from "@/lib/utilisateurs/utilisateur-service"
import {
  ROLES_ATTRIBUABLES_ADMIN,
  type UtilisateurRequest,
} from "@/lib/utilisateurs/types"

export function UtilisateurForm({
  redirectTo = "/dashboard/utilisateurs",
}: {
  redirectTo?: string
}) {
  const router = useRouter()

  const [nom, setNom] = useState("")
  const [prenom, setPrenom] = useState("")
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<Role | "">("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting) return

    if (!role) {
      toast.error("Veuillez sélectionner un rôle.")
      return
    }

    const payload: UtilisateurRequest = {
      nom: nom.trim(),
      prenom: prenom.trim(),
      email: email.trim(),
      role,
    }

    setIsSubmitting(true)
    try {
      const cree = await creerUtilisateur(payload)
      toast.success(
        `Utilisateur « ${cree.prenom} ${cree.nom} » créé. Ses identifiants lui ont été envoyés par email.`,
      )
      router.push(redirectTo)
      router.refresh()
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Création impossible. Vérifiez votre connexion réseau."
      toast.error(message)
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
              placeholder="Ex. Awa"
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
              placeholder="Ex. Kossi"
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
            placeholder="exemple@organisation.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
          />
          <FieldDescription>
            Un mot de passe sera généré et envoyé à cette adresse.
          </FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor="role">Rôle</FieldLabel>
          <Select
            value={role}
            onValueChange={(v) => setRole(v as Role)}
            disabled={isSubmitting}
          >
            <SelectTrigger id="role" className="w-full">
              <SelectValue placeholder="Sélectionner un rôle" />
            </SelectTrigger>
            <SelectContent>
              {ROLES_ATTRIBUABLES_ADMIN.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
            {isSubmitting ? "Création…" : "Créer l'utilisateur"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
