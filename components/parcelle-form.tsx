"use client"

// Formulaire de création / édition d'une parcelle.
// - Sans prop `parcelle` : mode création (POST).
// - Avec une `parcelle` initiale : mode édition (PUT).
//
// Logique du type de sol :
//   - PLEIN_AIR : toujours déduit automatiquement de la localisation (GPS).
//   - CONTROLE  : au choix — saisie manuelle OU déduction depuis la localisation.

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ImageIcon, LocateFixed, Sparkles, XIcon } from "lucide-react"

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
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import { ApiError } from "@/lib/api"
import {
  creerParcelle,
  detecterTypeSol,
  modifierParcelle,
} from "@/lib/parcelles/parcelle-service"
import { uploadPhotoParcelle } from "@/lib/parcelles/carte"
import {
  ENVIRONNEMENT_OPTIONS,
  TYPE_SOL_LABELS,
  TYPE_SOL_OPTIONS,
  type Environnement,
  type Parcelle,
  type ParcelleRequest,
  type TypeSol,
  type TypeSolDeduction,
} from "@/lib/parcelles/types"

type ModeSol = "manuel" | "gps"

export function ParcelleForm({
  parcelle,
  redirectTo = "/dashboard/parcelles",
}: {
  parcelle?: Parcelle
  redirectTo?: string
}) {
  const router = useRouter()
  const isEdit = Boolean(parcelle)

  // Photo
  const inputPhotoRef = useRef<HTMLInputElement>(null)
  const [photoFichier, setPhotoFichier] = useState<File | null>(null)
  const [photoApercu, setPhotoApercu] = useState<string | null>(null)
  const photoActuelle = photoApercu ?? parcelle?.photoUrl ?? null

  const [nom, setNom] = useState(parcelle?.nom ?? "")
  const [description, setDescription] = useState(parcelle?.description ?? "")
  const [superficie, setSuperficie] = useState(
    parcelle?.superficie != null ? String(parcelle.superficie) : "",
  )
  const [latitude, setLatitude] = useState(
    parcelle?.latitude != null ? String(parcelle.latitude) : "",
  )
  const [longitude, setLongitude] = useState(
    parcelle?.longitude != null ? String(parcelle.longitude) : "",
  )
  const [typeSol, setTypeSol] = useState<TypeSol | "">(parcelle?.typeSol ?? "")
  const [environnement, setEnvironnement] = useState<Environnement | "">(
    parcelle?.environnement ?? "",
  )
  // Mode de renseignement du sol en environnement contrôlé.
  const [modeSol, setModeSol] = useState<ModeSol>("manuel")
  // Résultat de la détection GPS (aperçu).
  const [detection, setDetection] = useState<TypeSolDeduction | null>(null)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLocating, setIsLocating] = useState(false)
  const [isDetecting, setIsDetecting] = useState(false)

  // Le type de sol doit-il être déduit du GPS ?
  const deductionGps =
    environnement === "PLEIN_AIR" ||
    (environnement === "CONTROLE" && modeSol === "gps")
  // Le type de sol doit-il être saisi manuellement ?
  const saisieManuelle = environnement === "CONTROLE" && modeSol === "manuel"

  function utiliserMaPosition() {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      toast.error("La géolocalisation n'est pas disponible sur cet appareil.")
      return
    }
    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(String(pos.coords.latitude))
        setLongitude(String(pos.coords.longitude))
        setDetection(null)
        setIsLocating(false)
        toast.success("Position actuelle récupérée.")
      },
      () => {
        setIsLocating(false)
        toast.error("Impossible d'obtenir votre position.")
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  function handleDetecter() {
    const lat = Number(latitude)
    const lon = Number(longitude)
    if (
      latitude.trim() === "" ||
      longitude.trim() === "" ||
      Number.isNaN(lat) ||
      Number.isNaN(lon)
    ) {
      toast.error("Renseignez d'abord la latitude et la longitude.")
      return
    }
    setIsDetecting(true)
    detecterTypeSol(lat, lon)
      .then((r) => {
        setDetection(r)
        toast.success(`Type de sol détecté : ${TYPE_SOL_LABELS[r.typeSol]}`)
      })
      .catch((e) => {
        toast.error(
          e instanceof ApiError ? e.message : "Détection impossible.",
        )
      })
      .finally(() => setIsDetecting(false))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting) return

    if (!environnement) {
      toast.error("Veuillez sélectionner un environnement.")
      return
    }

    const superficieNum = Number(superficie)
    if (Number.isNaN(superficieNum) || superficieNum <= 0) {
      toast.error("La superficie doit être un nombre supérieur à 0.")
      return
    }

    const aLocalisation = latitude.trim() !== "" && longitude.trim() !== ""
    const latitudeNum = Number(latitude)
    const longitudeNum = Number(longitude)

    if (saisieManuelle && !typeSol) {
      toast.error("Veuillez sélectionner un type de sol.")
      return
    }
    if (deductionGps && !aLocalisation) {
      toast.error(
        "La localisation est nécessaire pour déterminer le type de sol " +
          "(saisissez-la ou utilisez votre position).",
      )
      return
    }
    if (aLocalisation && (Number.isNaN(latitudeNum) || Number.isNaN(longitudeNum))) {
      toast.error("La latitude et la longitude doivent être des nombres.")
      return
    }

    const payload: ParcelleRequest = {
      nom: nom.trim(),
      description: description.trim() || undefined,
      superficie: superficieNum,
      environnement,
      // Type de sol : envoyé seulement en saisie manuelle ; sinon déduit backend.
      typeSol: saisieManuelle ? (typeSol as TypeSol) : undefined,
      // Localisation : envoyée dès qu'elle est renseignée.
      latitude: aLocalisation ? latitudeNum : undefined,
      longitude: aLocalisation ? longitudeNum : undefined,
    }

    setIsSubmitting(true)
    try {
      let parcelleId: number
      if (isEdit && parcelle) {
        await modifierParcelle(parcelle.id, payload)
        parcelleId = parcelle.id
        toast.success(`Parcelle « ${payload.nom} » mise à jour.`)
      } else {
        const creee = await creerParcelle(payload)
        parcelleId = creee.id
        toast.success(`Parcelle « ${creee.nom} » créée avec succès.`)
      }
      // Upload photo si une nouvelle a été sélectionnée
      if (photoFichier) {
        try {
          await uploadPhotoParcelle(parcelleId, photoFichier)
        } catch {
          toast.error("Parcelle enregistrée, mais l'upload de la photo a échoué.")
        }
      }
      router.push(redirectTo)
      router.refresh()
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

  const detailsDetection = detection
    ? `Argile ${Math.round(detection.argilePct)} % · Sable ${Math.round(
        detection.sablePct,
      )} % · Limon ${Math.round(detection.limonPct)} %`
    : null

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="nom">Nom de la parcelle</FieldLabel>
          <Input
            id="nom"
            name="nom"
            placeholder="Ex. Parcelle Nord"
            required
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            disabled={isSubmitting}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="description">Description</FieldLabel>
          <Input
            id="description"
            name="description"
            placeholder="Optionnel"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isSubmitting}
          />
          <FieldDescription>
            Une courte description de la parcelle (facultatif).
          </FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor="photo">
            Photo de la parcelle{" "}
            <span className="font-normal text-muted-foreground">(optionnel)</span>
          </FieldLabel>
          <div className="flex items-center gap-3">
            {photoActuelle ? (
              <div className="relative size-20 shrink-0 overflow-hidden rounded-lg border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photoActuelle}
                  alt="Aperçu"
                  className="size-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (photoApercu) URL.revokeObjectURL(photoApercu)
                    setPhotoFichier(null)
                    setPhotoApercu(null)
                    if (inputPhotoRef.current) inputPhotoRef.current.value = ""
                  }}
                  className="absolute right-0.5 top-0.5 rounded-full bg-black/60 p-0.5 text-white"
                  aria-label="Supprimer la photo"
                >
                  <XIcon className="size-3" />
                </button>
              </div>
            ) : (
              <div className="flex size-20 shrink-0 items-center justify-center rounded-lg border border-dashed bg-muted">
                <ImageIcon className="size-6 text-muted-foreground" />
              </div>
            )}
            <div className="flex flex-col gap-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => inputPhotoRef.current?.click()}
                disabled={isSubmitting}
              >
                {photoActuelle ? "Changer la photo" : "Choisir une photo"}
              </Button>
              <span className="text-xs text-muted-foreground">
                JPG, PNG ou WEBP
              </span>
              <input
                ref={inputPhotoRef}
                id="photo"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (!f) return
                  if (!f.type.startsWith("image/")) {
                    toast.error("Veuillez sélectionner une image.")
                    return
                  }
                  if (photoApercu) URL.revokeObjectURL(photoApercu)
                  setPhotoFichier(f)
                  setPhotoApercu(URL.createObjectURL(f))
                }}
              />
            </div>
          </div>
        </Field>

        <Field>
          <FieldLabel htmlFor="superficie">Superficie (m²)</FieldLabel>
          <Input
            id="superficie"
            name="superficie"
            type="number"
            step="0.01"
            min="0"
            placeholder="Ex. 1500"
            required
            value={superficie}
            onChange={(e) => setSuperficie(e.target.value)}
            disabled={isSubmitting}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="environnement">Environnement</FieldLabel>
          <Select
            value={environnement}
            onValueChange={(v) => {
              setEnvironnement(v as Environnement)
              setDetection(null)
            }}
            disabled={isSubmitting}
          >
            <SelectTrigger id="environnement" className="w-full">
              <SelectValue placeholder="Sélectionner un environnement" />
            </SelectTrigger>
            <SelectContent>
              {ENVIRONNEMENT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        {/* Localisation GPS */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="latitude">Latitude</FieldLabel>
            <Input
              id="latitude"
              name="latitude"
              type="number"
              step="any"
              placeholder="Ex. 6.1725"
              value={latitude}
              onChange={(e) => {
                setLatitude(e.target.value)
                setDetection(null)
              }}
              disabled={isSubmitting}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="longitude">Longitude</FieldLabel>
            <Input
              id="longitude"
              name="longitude"
              type="number"
              step="any"
              placeholder="Ex. 1.2314"
              value={longitude}
              onChange={(e) => {
                setLongitude(e.target.value)
                setDetection(null)
              }}
              disabled={isSubmitting}
            />
          </Field>
        </div>
        <Field>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-fit"
            onClick={utiliserMaPosition}
            disabled={isSubmitting || isLocating}
          >
            <LocateFixed className="size-4" />
            {isLocating ? "Localisation…" : "Utiliser ma position actuelle"}
          </Button>
        </Field>

        {/* Type de sol — dépend de l'environnement */}
        {environnement === "CONTROLE" && (
          <Field>
            <FieldLabel>Type de sol</FieldLabel>
            <ToggleGroup
              type="single"
              value={modeSol}
              onValueChange={(v) => {
                if (v) setModeSol(v as ModeSol)
              }}
              variant="outline"
              className="w-fit"
            >
              <ToggleGroupItem value="manuel">Manuel</ToggleGroupItem>
              <ToggleGroupItem value="gps">
                Depuis la localisation
              </ToggleGroupItem>
            </ToggleGroup>

            {modeSol === "manuel" ? (
              <Select
                value={typeSol}
                onValueChange={(v) => setTypeSol(v as TypeSol)}
                disabled={isSubmitting}
              >
                <SelectTrigger id="typeSol" className="mt-2 w-full">
                  <SelectValue placeholder="Sélectionner un type de sol" />
                </SelectTrigger>
                <SelectContent>
                  {TYPE_SOL_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="mt-2 flex flex-col gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="w-fit"
                  onClick={handleDetecter}
                  disabled={isSubmitting || isDetecting}
                >
                  <Sparkles className="size-4" />
                  {isDetecting ? "Détection…" : "Détecter le type de sol"}
                </Button>
                {detection && (
                  <p className="text-sm text-muted-foreground">
                    Détecté :{" "}
                    <span className="font-medium text-foreground">
                      {TYPE_SOL_LABELS[detection.typeSol]}
                    </span>{" "}
                    ({detailsDetection})
                  </p>
                )}
              </div>
            )}
          </Field>
        )}

        {environnement === "PLEIN_AIR" && (
          <Field>
            <FieldLabel>Type de sol</FieldLabel>
            <FieldDescription>
              Le type de sol sera déterminé automatiquement à partir de la
              localisation lors de l&apos;enregistrement.
            </FieldDescription>
            <div className="mt-1 flex flex-col gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="w-fit"
                onClick={handleDetecter}
                disabled={isSubmitting || isDetecting}
              >
                <Sparkles className="size-4" />
                {isDetecting ? "Détection…" : "Prévisualiser le type de sol"}
              </Button>
              {detection && (
                <p className="text-sm text-muted-foreground">
                  Détecté :{" "}
                  <span className="font-medium text-foreground">
                    {TYPE_SOL_LABELS[detection.typeSol]}
                  </span>{" "}
                  ({detailsDetection})
                </p>
              )}
            </div>
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
            {isSubmitting
              ? "Enregistrement…"
              : isEdit
                ? "Enregistrer les modifications"
                : "Créer la parcelle"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
