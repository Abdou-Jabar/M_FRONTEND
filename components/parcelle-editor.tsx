"use client"

// Charge une parcelle par son identifiant puis affiche le formulaire d'édition.
// Gère les états chargement / erreur (dont parcelle introuvable).

import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ParcelleForm } from "@/components/parcelle-form"
import { ApiError } from "@/lib/api"
import { getParcelle } from "@/lib/parcelles/parcelle-service"
import type { Parcelle } from "@/lib/parcelles/types"

export function ParcelleEditor({ id }: { id: number }) {
  const [parcelle, setParcelle] = useState<Parcelle | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let actif = true

    getParcelle(id)
      .then((data) => {
        if (actif) setParcelle(data)
      })
      .catch((e) => {
        if (!actif) return
        setError(
          e instanceof ApiError
            ? e.message
            : "Impossible de charger la parcelle.",
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

  if (error || !parcelle) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-8 text-sm text-muted-foreground">
        <p>{error ?? "Parcelle introuvable."}</p>
        <Button variant="outline" size="sm" asChild>
          <a href="/dashboard/parcelles">Retour aux parcelles</a>
        </Button>
      </div>
    )
  }

  return <ParcelleForm parcelle={parcelle} />
}
