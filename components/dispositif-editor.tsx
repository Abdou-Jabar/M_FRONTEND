"use client"

// Charge un dispositif par son identifiant puis affiche le formulaire d'édition.
// Gère les états chargement / erreur (dont dispositif introuvable).

import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { DispositifForm } from "@/components/dispositif-form"
import { ApiError } from "@/lib/api"
import { getDispositif } from "@/lib/dispositifs/dispositif-service"
import type { Dispositif } from "@/lib/dispositifs/types"

export function DispositifEditor({ id }: { id: number }) {
  const [dispositif, setDispositif] = useState<Dispositif | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let actif = true

    getDispositif(id)
      .then((data) => {
        if (actif) setDispositif(data)
      })
      .catch((e) => {
        if (!actif) return
        setError(
          e instanceof ApiError
            ? e.message
            : "Impossible de charger le dispositif.",
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
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    )
  }

  if (error || !dispositif) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-8 text-sm text-muted-foreground">
        <p>{error ?? "Dispositif introuvable."}</p>
        <Button variant="outline" size="sm" asChild>
          <a href="/dashboard/dispositifs">Retour aux dispositifs</a>
        </Button>
      </div>
    )
  }

  return <DispositifForm dispositif={dispositif} />
}
