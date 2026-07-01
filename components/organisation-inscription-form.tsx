"use client"

// Inscription d'une organisation en 2 étapes :
//  1) saisie des informations → on envoie un code de vérification à l'email
//  2) saisie du code → création effective de l'organisation + compte admin
// On vérifie ainsi l'email AVANT de créer quoi que ce soit.

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { ApiError } from "@/lib/api"
import {
  demanderCodeInscription,
  inscrireOrganisation,
} from "@/lib/organisations/organisation-service"

export function OrganisationInscriptionForm() {
  const router = useRouter()

  const [etape, setEtape] = useState<"infos" | "code">("infos")

  const [nomOrganisation, setNomOrganisation] = useState("")
  const [nom, setNom] = useState("")
  const [prenom, setPrenom] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmation, setConfirmation] = useState("")
  const [code, setCode] = useState("")

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isResending, setIsResending] = useState(false)

  // Étape 1 → envoi du code de vérification
  async function handleInfos(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting) return

    if (password.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères.")
      return
    }
    if (password !== confirmation) {
      toast.error("Les mots de passe ne correspondent pas.")
      return
    }

    setIsSubmitting(true)
    try {
      await demanderCodeInscription(email.trim())
      toast.success("Un code de vérification a été envoyé à votre email.")
      setEtape("code")
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Envoi du code impossible. Vérifiez votre connexion réseau.",
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  // Étape 2 → création de l'organisation après vérification du code
  async function handleCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting) return

    if (!code.trim()) {
      toast.error("Saisissez le code reçu par email.")
      return
    }

    setIsSubmitting(true)
    try {
      await inscrireOrganisation({
        nomOrganisation: nomOrganisation.trim(),
        nom: nom.trim(),
        prenom: prenom.trim(),
        email: email.trim(),
        password,
        code: code.trim(),
      })
      toast.success(
        "Organisation créée. Elle est en attente de validation par l'équipe AgriSmart.",
      )
      router.push("/login")
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Inscription impossible. Vérifiez votre connexion réseau.",
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleResend() {
    if (isResending) return
    setIsResending(true)
    try {
      await demanderCodeInscription(email.trim())
      toast.success("Un nouveau code a été envoyé à votre email.")
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : "Envoi impossible.",
      )
    } finally {
      setIsResending(false)
    }
  }

  if (etape === "code") {
    return (
      <form onSubmit={handleCode} className="flex flex-col gap-6">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="code">Code de vérification</FieldLabel>
            <Input
              id="code"
              value={code}
              onChange={(e) =>
                setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              placeholder="Code à 6 chiffres"
              inputMode="numeric"
              autoComplete="one-time-code"
              className="text-center text-lg tracking-[0.5em]"
              disabled={isSubmitting}
            />
            <FieldDescription>
              Un code a été envoyé à <strong>{email}</strong>. Saisissez-le pour
              finaliser la création de votre organisation.
            </FieldDescription>
          </Field>

          <Field>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Création…" : "Créer mon organisation"}
            </Button>
          </Field>

          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setEtape("infos")}
              disabled={isSubmitting}
            >
              <ArrowLeft className="size-4" />
              Modifier mes informations
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleResend}
              disabled={isResending || isSubmitting}
            >
              {isResending ? "Envoi…" : "Renvoyer le code"}
            </Button>
          </div>
        </FieldGroup>
      </form>
    )
  }

  return (
    <form onSubmit={handleInfos} className="flex flex-col gap-6">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="nomOrganisation">
            Nom de l&apos;organisation
          </FieldLabel>
          <Input
            id="nomOrganisation"
            placeholder="Ex. Coopérative de Lomé"
            required
            value={nomOrganisation}
            onChange={(e) => setNomOrganisation(e.target.value)}
            disabled={isSubmitting}
          />
          <FieldDescription>
            C&apos;est le nom de votre exploitation ou coopérative.
          </FieldDescription>
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="prenom">Prénom</FieldLabel>
            <Input
              id="prenom"
              placeholder="Votre prénom"
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
              placeholder="Votre nom"
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
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
          />
          <FieldDescription>
            Vous serez l&apos;administrateur. Un code de confirmation y sera
            envoyé.
          </FieldDescription>
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="password">Mot de passe</FieldLabel>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="confirmation">Confirmation</FieldLabel>
            <Input
              id="confirmation"
              type="password"
              autoComplete="new-password"
              required
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              disabled={isSubmitting}
            />
          </Field>
        </div>

        <Field>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Envoi du code…" : "Continuer"}
          </Button>
          <FieldDescription className="text-center">
            Vous avez déjà un compte ?{" "}
            <a href="/login" className="font-medium underline underline-offset-4">
              Se connecter
            </a>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
