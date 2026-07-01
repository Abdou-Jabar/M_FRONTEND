"use client"

// Charge un capteur par son identifiant puis affiche le formulaire d'édition.
// Gère les états chargement / erreur (dont capteur introuvable).

import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { CapteurForm } from "@/components/capteur-form"
import { ApiError } from "@/lib/api"
import { getCapteur } from "@/lib/capteurs/capteur-service"
import type { Capteur } from "@/lib/capteurs/types"

export function CapteurEditor({ id }: { id: number }) {
  const [capteur, setCapteur] = useState<Capteur | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let actif = true

    getCapteur(id)
      .then((data) => {
        if (actif) setCapteur(data)
      })
      .catch((e) => {
        if (!actif) return
        setError(
          e instanceof ApiError
            ? e.message
            : "Impossible de charger le capteur.",
        )
      })
      .finally(() => {
        if (actif) setIsLoading(false)
      })

    return () => {
      actif = false
    }
  }, [id])

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    )
  }

  if (error || !capteur) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-8 text-sm text-muted-foreground">
        <p>{error ?? "Capteur introuvable."}</p>
        <Button variant="outline" size="sm" asChild>
          <a href="/dashboard/capteurs">Retour aux capteurs</a>
        </Button>
      </div>
    )
  }

  return <CapteurForm capteur={capteur} />
}
