"use client"

import { useState } from "react"
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
import { useAuth } from "@/lib/auth/use-auth"
import { ROLES_CLIENT, ROLES_EQUIPE } from "@/lib/auth/types"
import { ApiError } from "@/lib/api"

// Options de personnalisation du formulaire de connexion.
// Elles permettent de réutiliser le même composant shadcn pour deux pages
// de connexion différentes (espace utilisateurs et espace administrateur).
type LoginFormProps = Omit<React.ComponentProps<"form">, "onSubmit"> & {
  // Titre affiché en haut du formulaire.
  title?: string
  // Texte d'explication sous le titre.
  description?: string
  // Libellé du bouton de validation.
  submitLabel?: string
  // Affiche ou non le lien d'inscription en bas du formulaire.
  showSignUp?: boolean
  // Lien vers la page d'inscription (utile uniquement si showSignUp est vrai).
  signUpHref?: string
  // Espace concerné : détermine les rôles autorisés et la redirection.
  espace?: "app" | "admin"
  // Destination après une connexion réussie (par défaut la racine de l'espace).
  redirectTo?: string
}

export function LoginForm({
  className,
  title = "Connectez-vous à votre compte",
  description = "Saisissez votre adresse e-mail pour vous connecter",
  submitLabel = "Se connecter",
  showSignUp = true,
  signUpHref = "#",
  espace = "app",
  redirectTo = "/dashboard",
  ...props
}: LoginFormProps) {
  const router = useRouter()
  const { login, logout } = useAuth()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting) return

    setIsSubmitting(true)
    try {
      const user = await login({ email, password })

      // Contrôle de l'espace : un compte équipe ne se connecte pas sur l'espace
      // client, et inversement.
      const rolesAutorises = espace === "admin" ? ROLES_EQUIPE : ROLES_CLIENT
      if (!rolesAutorises.includes(user.role)) {
        logout()
        toast.error(
          espace === "admin"
            ? "Ce compte n'a pas accès à l'espace équipe."
            : "Ce compte n'a pas accès à l'espace client.",
        )
        return
      }

      toast.success(`Bienvenue, ${user.prenom} !`)

      // Compte à mot de passe généré : changement obligatoire avant tout accès.
      if (user.premiereConnexion) {
        router.push("/changer-mot-de-passe")
        return
      }

      router.push(redirectTo)
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Connexion impossible. Vérifiez votre connexion réseau."
      toast.error(message)
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
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-sm text-balance text-muted-foreground">
            {description}
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="email">E-mail</FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="exemple@agrismart.com"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
            className="bg-background"
          />
        </Field>
        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Mot de passe</FieldLabel>
            <a
              href="#"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Mot de passe oublié ?
            </a>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isSubmitting}
            className="bg-background"
          />
        </Field>
        <Field>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Connexion…" : submitLabel}
          </Button>
        </Field>

        {/* Lien d'inscription d'organisation, masqué pour l'espace admin. */}
        {showSignUp && (
          <FieldDescription className="text-center">
            Vous n&apos;avez pas encore d&apos;organisation ?{" "}
            <a
              href={signUpHref}
              className="font-medium underline underline-offset-4"
            >
              Inscrire votre organisation
            </a>
          </FieldDescription>
        )}
      </FieldGroup>
    </form>
  )
}
