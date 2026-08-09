"use client"

// Formulaire de démarrage d'une nouvelle culture : parcelle + type de
// culture (catalogue superviseur) + saison. Le seuil d'alerte est choisi
// automatiquement par le backend (type de culture × saison × type de sol
// de la parcelle, puis seuil SAD en secours).

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { ApiError } from "@/lib/api"
import { creerCulture } from "@/lib/cultures/culture-service"
import { SAISON_LABELS, type Saison } from "@/lib/cultures/types"
import { getParcelles } from "@/lib/parcelles/parcelle-service"
import type { Parcelle } from "@/lib/parcelles/types"
import { getTypesCulture } from "@/lib/types-culture/type-culture-service"
import type { TypeCulture } from "@/lib/types-culture/types"

export function CultureForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  // Parcelle présélectionnée quand on vient de la page d'une parcelle.
  const parcelleIdInitiale = searchParams.get("parcelleId") ?? ""

  const [parcelles, setParcelles] = useState<Parcelle[]>([])
  const [typesCulture, setTypesCulture] = useState<TypeCulture[]>([])
  const [chargement, setChargement] = useState(true)

  const [parcelleId, setParcelleId] = useState(parcelleIdInitiale)
  const [typeCultureId, setTypeCultureId] = useState("")
  const [saison, setSaison] = useState<Saison | "">("")
  const [enregistrement, setEnregistrement] = useState(false)

  useEffect(() => {
    let actif = true
    Promise.all([getParcelles(), getTypesCulture()])
      .then(([ps, ts]) => {
        if (!actif) return
        setParcelles(ps)
        setTypesCulture(ts)
      })
      .catch(() => {
        if (actif)
          toast.error("Impossible de charger les parcelles ou le catalogue.")
      })
      .finally(() => {
        if (actif) setChargement(false)
      })
    return () => {
      actif = false
    }
  }, [])

  async function soumettre() {
    if (!parcelleId) {
      toast.error("Veuillez sélectionner une parcelle.")
      return
    }
    if (!typeCultureId) {
      toast.error("Veuillez sélectionner un type de culture.")
      return
    }
    if (!saison) {
      toast.error("Veuillez sélectionner une saison.")
      return
    }
    setEnregistrement(true)
    try {
      const culture = await creerCulture({
        parcelleId: Number(parcelleId),
        typeCultureId: Number(typeCultureId),
        saison,
      })
      toast.success(
        `Culture « ${culture.typeCultureNom} » démarrée sur ${culture.parcelleNom}.` +
          (culture.seuilAlerteId
            ? ""
            : " Aucun seuil d'alerte ne correspond : les alertes ne seront pas générées."),
      )
      router.push("/dashboard/cultures")
    } catch (e) {
      toast.error(
        e instanceof ApiError ? e.message : "Échec de la création.",
      )
    } finally {
      setEnregistrement(false)
    }
  }

  if (chargement) {
    return (
      <div className="flex max-w-xl flex-col gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    )
  }

  return (
    <div className="flex max-w-xl flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label>Parcelle</Label>
        <Select value={parcelleId} onValueChange={setParcelleId}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner une parcelle" />
          </SelectTrigger>
          <SelectContent>
            {parcelles.map((p) => (
              <SelectItem key={p.id} value={String(p.id)}>
                {p.nom}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label>Type de culture</Label>
        <Select value={typeCultureId} onValueChange={setTypeCultureId}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un type de culture" />
          </SelectTrigger>
          <SelectContent>
            {typesCulture.map((t) => (
              <SelectItem key={t.id} value={String(t.id)}>
                {t.nom}
                {t.variete ? ` — ${t.variete}` : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Le seuil d&apos;alerte adapté (type de culture, saison, type de sol)
          est appliqué automatiquement.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Label>Saison</Label>
        <Select value={saison} onValueChange={(v) => setSaison(v as Saison)}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner la saison" />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(SAISON_LABELS) as Saison[]).map((s) => (
              <SelectItem key={s} value={s}>
                {SAISON_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Button onClick={soumettre} disabled={enregistrement}>
          {enregistrement ? "Création…" : "Démarrer la culture"}
        </Button>
        <Button
          variant="outline"
          onClick={() => router.back()}
          disabled={enregistrement}
        >
          Annuler
        </Button>
      </div>
    </div>
  )
}
