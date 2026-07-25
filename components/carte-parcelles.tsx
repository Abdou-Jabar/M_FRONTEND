"use client"

// Wrapper du composant Leaflet chargé dynamiquement (no SSR).
// Leaflet utilise `window` et ne peut pas être rendu côté serveur.
// Ce composant gère aussi le chargement des données depuis l'API.

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { MapPinOffIcon } from "lucide-react"

import { Skeleton } from "@/components/ui/skeleton"
import { ApiError } from "@/lib/api"
import {
  getParcellesPourCarte,
  type ParcelleCartePoint,
} from "@/lib/parcelles/carte"

// Import dynamique : Leaflet est chargé seulement dans le navigateur.
const CarteParcellesInner = dynamic(
  () =>
    import("@/components/carte-parcelles-inner").then(
      (m) => m.CarteParcellesInner,
    ),
  {
    ssr: false,
    loading: () => (
      <Skeleton className="h-full w-full rounded-xl" />
    ),
  },
)

export function CarteParcelles({
  lienDetailBase,
  afficherOrganisation = false,
  lienCliquable = true,
  hauteur = "500px",
}: {
  lienDetailBase: string
  afficherOrganisation?: boolean
  lienCliquable?: boolean
  hauteur?: string
}) {
  const [parcelles, setParcelles] = useState<ParcelleCartePoint[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let actif = true
    getParcellesPourCarte()
      .then((data) => {
        if (!actif) return
        setParcelles(data)
        setError(null)
      })
      .catch((e) => {
        if (!actif) return
        setError(
          e instanceof ApiError
            ? e.message
            : "Impossible de charger la carte.",
        )
      })
      .finally(() => {
        if (actif) setIsLoading(false)
      })
    return () => {
      actif = false
    }
  }, [])

  if (isLoading) {
    return <Skeleton style={{ height: hauteur }} className="w-full rounded-xl" />
  }

  if (error) {
    return (
      <div
        style={{ height: hauteur }}
        className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed text-sm text-muted-foreground"
      >
        <MapPinOffIcon className="size-8 opacity-40" />
        <p>{error}</p>
      </div>
    )
  }

  // Parcelles sans coordonnées GPS filtrées côté backend — si tout est vide :
  if (parcelles.length === 0) {
    return (
      <div
        style={{ height: hauteur }}
        className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed text-sm text-muted-foreground"
      >
        <MapPinOffIcon className="size-8 opacity-40" />
        <p>Aucune parcelle avec coordonnées GPS à afficher.</p>
      </div>
    )
  }

  return (
    <div style={{ height: hauteur }} className="w-full overflow-hidden rounded-xl border">
      <CarteParcellesInner
        parcelles={parcelles}
        lienDetailBase={lienDetailBase}
        afficherOrganisation={afficherOrganisation}
        lienCliquable={lienCliquable}
      />
    </div>
  )
}
