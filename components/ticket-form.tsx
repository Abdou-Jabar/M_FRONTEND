"use client"

// Formulaire de création d'un ticket de support.
// Accessible aux rôles AGRICULTEUR et ADMIN.
// - Titre (obligatoire)
// - Description (obligatoire)
// - Parcelle (optionnelle, liste déroulante)
// - Photos (optionnel, max 3)

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ArrowLeftIcon } from "lucide-react"
import Link from "next/link"

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
import { Separator } from "@/components/ui/separator"
import { PhotosTicketUpload } from "@/components/photos-ticket-upload"
import type { PhotoPreview } from "@/components/photos-ticket-upload"
import { ApiError } from "@/lib/api"
import { creerTicket } from "@/lib/tickets/ticket-service"
import { getParcelles } from "@/lib/parcelles/parcelle-service"
import type { Parcelle } from "@/lib/parcelles/types"

export function TicketForm() {
  const router = useRouter()

  const [titre, setTitre] = useState("")
  const [description, setDescription] = useState("")
  const [parcelleId, setParcelleId] = useState<string>("")
  const [photos, setPhotos] = useState<PhotoPreview[]>([])
  const [parcelles, setParcelles] = useState<Parcelle[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Chargement de la liste des parcelles pour la liste déroulante.
  useEffect(() => {
    let actif = true
    getParcelles()
      .then((data) => { if (actif) setParcelles(data) })
      .catch(() => { /* non bloquant — le champ reste visible sans options */ })
    return () => { actif = false }
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (isSubmitting) return

    if (titre.trim() === "") {
      toast.error("Le titre est obligatoire.")
      return
    }
    if (description.trim() === "") {
      toast.error("La description est obligatoire.")
      return
    }

    setIsSubmitting(true)
    try {
      const ticket = await creerTicket(
        {
          titre: titre.trim(),
          description: description.trim(),
          parcelleId: parcelleId ? Number(parcelleId) : null,
        },
        photos.map((p) => p.file),
      )

      // Libère les URLs blob pour éviter les fuites mémoire.
      for (const p of photos) URL.revokeObjectURL(p.previewUrl)

      toast.success(`Ticket #${ticket.id} créé avec succès.`)
      router.push(`/dashboard/tickets/${ticket.id}`)
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
    <div className="flex flex-col gap-6">
      <Button variant="ghost" size="sm" className="w-fit" asChild>
        <Link href="/dashboard/tickets">
          <ArrowLeftIcon className="size-4" />
          Retour aux tickets
        </Link>
      </Button>

      <form onSubmit={handleSubmit}>
        <FieldGroup>
          {/* Titre */}
          <Field>
            <FieldLabel htmlFor="titre">Titre</FieldLabel>
            <Input
              id="titre"
              placeholder="Résumez le problème en une phrase"
              required
              maxLength={255}
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              disabled={isSubmitting}
            />
          </Field>

          {/* Description */}
          <Field>
            <FieldLabel htmlFor="description">Description</FieldLabel>
            <textarea
              id="description"
              placeholder="Décrivez le problème en détail : depuis quand, sur quelle parcelle, ce que vous avez observé…"
              required
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <FieldDescription>
              Plus vous êtes précis, plus vite le problème sera résolu.
            </FieldDescription>
          </Field>

          <Separator />

          {/* Parcelle (optionnel) */}
          <Field>
            <FieldLabel htmlFor="parcelle">
              Parcelle concernée{" "}
              <span className="font-normal text-muted-foreground">(optionnel)</span>
            </FieldLabel>
            <Select
              value={parcelleId}
              onValueChange={setParcelleId}
              disabled={isSubmitting || parcelles.length === 0}
            >
              <SelectTrigger id="parcelle" className="w-full">
                <SelectValue
                  placeholder={
                    parcelles.length === 0
                      ? "Aucune parcelle disponible"
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
          </Field>

          {/* Photos */}
          <Field>
            <FieldLabel>
              Photos{" "}
              <span className="font-normal text-muted-foreground">(optionnel, max 3)</span>
            </FieldLabel>
            <PhotosTicketUpload
              photos={photos}
              onFilesChange={setPhotos}
              disabled={isSubmitting}
            />
            <FieldDescription>
              Joignez des captures d&apos;écran ou photos qui illustrent le problème.
            </FieldDescription>
          </Field>

          {/* Actions */}
          <Field orientation="horizontal" className="justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard/tickets")}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Envoi en cours…" : "Soumettre le ticket"}
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </div>
  )
}
