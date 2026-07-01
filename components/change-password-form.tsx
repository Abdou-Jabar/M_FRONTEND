"use client"

// Formulaire de changement de mot de passe. Utilisé notamment pour le
// changement obligatoire à la première connexion des comptes créés avec un mot
// de passe généré (techniciens, agriculteurs, comptes d'équipe).

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { ApiError } from "@/lib/api"
import { changerMotDePasse } from "@/lib/auth/auth-service"
import { useAuth } from "@/lib/auth/use-auth"

export function ChangePasswordForm({
  className,
  ...props
}: Omit<React.ComponentProps<"form">, "onSubmit">) {
  const router = useRouter()
  const { user, isAuthenticated, isLoading, marquerMotDePasseChange } = useAuth()

  const [ancien, setAncien] = useState("")
  const [nouveau, setNouveau] = useState("")
  const [confirmation, setConfirmation] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Accès réservé aux utilisateurs connectés.
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login")
    }
  }, [isLoading, isAuthenticated, router])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting) return

    if (nouveau.length < 8) {
      toast.error("Le nouveau mot de passe doit contenir au moins 8 caractères.")
      return
    }
    if (nouveau !== confirmation) {
      toast.error("La confirmation ne correspond pas au nouveau mot de passe.")
      return
    }
    if (nouveau === ancien) {
      toast.error("Le nouveau mot de passe doit être différent de l'ancien.")
      return
    }

    setIsSubmitting(true)
    try {
      await changerMotDePasse({
        ancienMotDePasse: ancien,
        nouveauMotDePasse: nouveau,
      })
      marquerMotDePasseChange()
      toast.success("Mot de passe mis à jour. Bienvenue !")
      router.replace("/dashboard")
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Changement impossible. Vérifiez votre connexion réseau.",
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={handleSubmit}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Changez votre mot de passe</h1>
          <p className="text-sm text-balance text-muted-foreground">
            {user
              ? `Bonjour ${user.prenom}, pour sécuriser votre compte, définissez un nouveau mot de passe avant de continuer.`
              : "Définissez un nouveau mot de passe avant de continuer."}
          </p>
        </div>

        <Field>
          <FieldLabel htmlFor="ancien">Mot de passe actuel</FieldLabel>
          <Input
            id="ancien"
            type="password"
            autoComplete="current-password"
            required
            value={ancien}
            onChange={(e) => setAncien(e.target.value)}
            disabled={isSubmitting}
            className="bg-background"
          />
          <FieldDescription>
            Celui reçu par email lors de la création de votre compte.
          </FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor="nouveau">Nouveau mot de passe</FieldLabel>
          <Input
            id="nouveau"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={nouveau}
            onChange={(e) => setNouveau(e.target.value)}
            disabled={isSubmitting}
            className="bg-background"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="confirmation">
            Confirmer le nouveau mot de passe
          </FieldLabel>
          <Input
            id="confirmation"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            disabled={isSubmitting}
            className="bg-background"
          />
        </Field>

        <Field>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Enregistrement…" : "Enregistrer et continuer"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
