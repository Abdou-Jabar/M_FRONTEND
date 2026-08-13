"use client"

// Réinitialisation du mot de passe en deux étapes :
//  1. saisie de l'email → envoi d'un code de vérification (30 min) ;
//  2. saisie du code + nouveau mot de passe.
// La réponse de l'étape 1 est identique que l'email existe ou non
// (anti-énumération) : le message reste donc volontairement générique.

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
import { PasswordInput } from "@/components/ui/password-input"
import { ApiError } from "@/lib/api"
import {
  demanderCodeReinitialisation,
  reinitialiserMotDePasse,
} from "@/lib/auth/auth-service"

type MotDePasseOublieFormProps = Omit<
  React.ComponentProps<"form">,
  "onSubmit"
> & {
  // Lien de retour vers la page de connexion de l'espace concerné.
  loginHref?: string
}

export function MotDePasseOublieForm({
  className,
  loginHref = "/login",
  ...props
}: MotDePasseOublieFormProps) {
  const router = useRouter()

  const [etape, setEtape] = useState<"email" | "code">("email")
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [nouveau, setNouveau] = useState("")
  const [confirmation, setConfirmation] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function envoyerCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting) return
    setIsSubmitting(true)
    try {
      await demanderCodeReinitialisation(email.trim())
      toast.success(
        "Si un compte existe pour cet email, un code vient d'être envoyé.",
      )
      setEtape("code")
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Envoi impossible. Vérifiez votre connexion réseau.",
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  async function reinitialiser(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting) return
    if (nouveau.length < 8) {
      toast.error("Le mot de passe doit contenir au moins 8 caractères.")
      return
    }
    if (nouveau !== confirmation) {
      toast.error("La confirmation ne correspond pas au nouveau mot de passe.")
      return
    }
    setIsSubmitting(true)
    try {
      await reinitialiserMotDePasse({
        email: email.trim(),
        code: code.trim(),
        nouveauMotDePasse: nouveau,
      })
      toast.success(
        "Mot de passe réinitialisé. Vous pouvez vous connecter.",
      )
      router.push(loginHref)
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Réinitialisation impossible. Veuillez réessayer.",
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── Étape 2 : code + nouveau mot de passe ─────────────────
  if (etape === "code") {
    return (
      <form
        className={cn("flex flex-col gap-6", className)}
        onSubmit={reinitialiser}
        {...props}
      >
        <FieldGroup>
          <div className="flex flex-col items-center gap-1 text-center">
            <h1 className="text-2xl font-bold">Vérifiez vos emails</h1>
            <p className="text-sm text-balance text-muted-foreground">
              Saisissez le code reçu à {email || "votre adresse"} puis
              choisissez un nouveau mot de passe.
            </p>
          </div>
          <Field>
            <FieldLabel htmlFor="code">Code de vérification</FieldLabel>
            <Input
              id="code"
              inputMode="numeric"
              maxLength={6}
              placeholder="123456"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={isSubmitting}
              className="bg-background text-center font-mono tracking-[0.4em]"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="nouveau">Nouveau mot de passe</FieldLabel>
            <PasswordInput
              id="nouveau"
              autoComplete="new-password"
              required
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
            <PasswordInput
              id="confirmation"
              autoComplete="new-password"
              required
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              disabled={isSubmitting}
              className="bg-background"
            />
          </Field>
          <Field>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Réinitialisation…" : "Réinitialiser"}
            </Button>
          </Field>
          <FieldDescription className="text-center">
            Code non reçu ?{" "}
            <button
              type="button"
              onClick={() => setEtape("email")}
              className="font-medium underline underline-offset-4"
            >
              Renvoyer un code
            </button>
          </FieldDescription>
        </FieldGroup>
      </form>
    )
  }

  // ── Étape 1 : email ───────────────────────────────────────
  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={envoyerCode}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Mot de passe oublié</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Saisissez votre email : nous vous enverrons un code de
            réinitialisation valable 30 minutes.
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="email">E-mail</FieldLabel>
          <Input
            id="email"
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
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Envoi…" : "Envoyer le code"}
          </Button>
        </Field>
        <FieldDescription className="text-center">
          <a
            href={loginHref}
            className="font-medium underline underline-offset-4"
          >
            Retour à la connexion
          </a>
        </FieldDescription>
      </FieldGroup>
    </form>
  )
}
