"use client"

// Formulaire de création d'un utilisateur par l'ADMIN d'une organisation.
// Le mot de passe est généré côté backend et envoyé par email à l'utilisateur.
// Pour un AGRICULTEUR, l'ADMIN peut affecter des parcelles dès la création.

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
import { Skeleton } from "@/components/ui/skeleton"
import { ApiError } from "@/lib/api"
import type { Role } from "@/lib/auth/types"
import { getParcelles } from "@/lib/parcelles/parcelle-service"
import type { Parcelle } from "@/lib/parcelles/types"
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

  // Parcelles de l'organisation, pour l'affectation d'un AGRICULTEUR.
  const [parcelles, setParcelles] = useState<Parcelle[]>([])
  const [parcellesLoading, setParcellesLoading] = useState(true)
  const [parcelleIds, setParcelleIds] = useState<number[]>([])

  useEffect(() => {
    let actif = true
    getParcelles()
      .then((data) => {
        if (actif) setParcelles(data.filter((p) => p.actif))
      })
      .catch(() => {
        if (actif) {
          toast.error(
            "Impossible de charger les parcelles — l'affectation sera indisponible.",
          )
        }
      })
      .finally(() => {
        if (actif) setParcellesLoading(false)
      })
    return () => {
      actif = false
    }
  }, [])

  function toggleParcelle(id: number, coche: boolean) {
    setParcelleIds((prev) =>
      coche ? [...prev, id] : prev.filter((p) => p !== id),
    )
  }

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
      // L'affectation ne concerne que les agriculteurs (un ADMIN a déjà
      // accès à toutes les parcelles de son organisation).
      ...(role === "AGRICULTEUR" && parcelleIds.length > 0
        ? { parcelleIds }
        : {}),
    }

    setIsSubmitting(true)
    try {
      const cree = await creerUtilisateur(payload)
      const nbParcelles =
        role === "AGRICULTEUR" ? parcelleIds.length : 0
      toast.success(
        `Utilisateur « ${cree.prenom} ${cree.nom} » créé${
          nbParcelles > 0
            ? ` et affecté à ${nbParcelles} parcelle${nbParcelles > 1 ? "s" : ""}`
            : ""
        }. Ses identifiants lui ont été envoyés par email.`,
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

        {role === "AGRICULTEUR" && (
          <Field>
            <FieldLabel>Parcelles à affecter</FieldLabel>
            <FieldDescription>
              L&apos;agriculteur ne verra que les parcelles qui lui sont
              affectées. Vous pourrez modifier ces affectations plus tard.
            </FieldDescription>
            {parcellesLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-5 w-1/2" />
              </div>
            ) : parcelles.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Aucune parcelle disponible dans votre organisation.
              </p>
            ) : (
              <div className="grid max-h-56 gap-2 overflow-y-auto rounded-md border p-3 sm:grid-cols-2">
                {parcelles.map((parcelle) => (
                  <label
                    key={parcelle.id}
                    className="flex cursor-pointer items-center gap-2 text-sm"
                  >
                    <Checkbox
                      checked={parcelleIds.includes(parcelle.id)}
                      onCheckedChange={(coche) =>
                        toggleParcelle(parcelle.id, coche === true)
                      }
                      disabled={isSubmitting}
                    />
                    <span className="truncate">
                      {parcelle.nom}
                      <span className="text-muted-foreground">
                        {" "}· {parcelle.superficie} m²
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            )}
          </Field>
        )}

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
