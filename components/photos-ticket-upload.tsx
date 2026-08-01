"use client"

// Composant d'upload de photos pour un ticket (max 3 images).
// Affiche les aperçus avec bouton de suppression individuel.
// Exposé via callback onFilesChange pour que le parent gère la liste.

import { useRef } from "react"
import { ImageIcon, XIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"

const MAX_PHOTOS = 3
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]

export interface PhotoPreview {
  file: File
  previewUrl: string
}

interface PhotosTicketUploadProps {
  photos: PhotoPreview[]
  onFilesChange: (photos: PhotoPreview[]) => void
  disabled?: boolean
}

export function PhotosTicketUpload({
  photos,
  onFilesChange,
  disabled = false,
}: PhotosTicketUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return

    // Réinitialise la valeur pour permettre de re-sélectionner le même fichier.
    if (inputRef.current) inputRef.current.value = ""

    const places = MAX_PHOTOS - photos.length
    if (places <= 0) {
      toast.error(`Maximum ${MAX_PHOTOS} photos autorisées par ticket.`)
      return
    }

    const valides: PhotoPreview[] = []
    for (const file of files.slice(0, places)) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        toast.error(`"${file.name}" n'est pas une image valide (JPG, PNG, WEBP).`)
        continue
      }
      valides.push({ file, previewUrl: URL.createObjectURL(file) })
    }

    if (files.length > places) {
      toast.warning(
        `Seulement ${places} photo(s) ajoutée(s) — limite de ${MAX_PHOTOS} atteinte.`,
      )
    }

    if (valides.length > 0) {
      onFilesChange([...photos, ...valides])
    }
  }

  function retirerPhoto(index: number) {
    const copie = [...photos]
    URL.revokeObjectURL(copie[index].previewUrl)
    copie.splice(index, 1)
    onFilesChange(copie)
  }

  const peutAjouter = photos.length < MAX_PHOTOS && !disabled

  return (
    <div className="flex flex-col gap-3">
      {/* Grille des aperçus */}
      {photos.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {photos.map((p, i) => (
            <div
              key={p.previewUrl}
              className="relative size-24 shrink-0 overflow-hidden rounded-lg border"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.previewUrl}
                alt={`Photo ${i + 1}`}
                className="size-full object-cover"
              />
              <button
                type="button"
                onClick={() => retirerPhoto(i)}
                disabled={disabled}
                aria-label={`Retirer la photo ${i + 1}`}
                className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white transition-opacity hover:bg-black/80 disabled:opacity-50"
              >
                <XIcon className="size-3" />
              </button>
            </div>
          ))}

          {/* Slot vide pour indiquer les places restantes */}
          {Array.from({ length: MAX_PHOTOS - photos.length }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="flex size-24 shrink-0 items-center justify-center rounded-lg border border-dashed bg-muted"
            >
              <ImageIcon className="size-6 text-muted-foreground/40" />
            </div>
          ))}
        </div>
      )}

      {/* Bouton d'ajout */}
      <div className="flex items-center gap-3">
        {photos.length === 0 && (
          <div className="flex size-24 shrink-0 items-center justify-center rounded-lg border border-dashed bg-muted">
            <ImageIcon className="size-6 text-muted-foreground/40" />
          </div>
        )}
        <div className="flex flex-col gap-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
            disabled={!peutAjouter}
          >
            {photos.length === 0 ? "Ajouter des photos" : "Ajouter une photo"}
          </Button>
          <span className="text-xs text-muted-foreground">
            {photos.length}/{MAX_PHOTOS} — JPG, PNG ou WEBP
          </span>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileSelect}
            disabled={!peutAjouter}
          />
        </div>
      </div>
    </div>
  )
}
