"use client"

// Vue superviseur (lecture seule) de toutes les missions, tous techniciens
// confondus. Kanban ou liste, sans possibilité de modifier le statut.

import { useEffect, useState } from "react"
import { KanbanSquare, List } from "lucide-react"

import { Skeleton } from "@/components/ui/skeleton"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import { MissionsKanban } from "@/components/missions-kanban"
import { MissionsListe } from "@/components/missions-liste"
import { ApiError } from "@/lib/api"
import { getToutesMissions } from "@/lib/affectations/affectation-service"
import type { Affectation } from "@/lib/affectations/types"

type Vue = "kanban" | "liste"

export function SupervisionMissions() {
  const [missions, setMissions] = useState<Affectation[]>([])
  const [vue, setVue] = useState<Vue>("kanban")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let actif = true
    getToutesMissions()
      .then((data) => {
        if (!actif) return
        setMissions(data)
        setError(null)
      })
      .catch((e) => {
        if (!actif) return
        setError(
          e instanceof ApiError
            ? e.message
            : "Impossible de charger les missions.",
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
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed p-8 text-sm text-muted-foreground">
        {error}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <ToggleGroup
          type="single"
          value={vue}
          onValueChange={(v) => {
            if (v) setVue(v as Vue)
          }}
          variant="outline"
        >
          <ToggleGroupItem value="kanban" aria-label="Vue kanban">
            <KanbanSquare className="size-4" />
            Kanban
          </ToggleGroupItem>
          <ToggleGroupItem value="liste" aria-label="Vue liste">
            <List className="size-4" />
            Liste
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {vue === "kanban" ? (
        <MissionsKanban missions={missions} readOnly afficherTechnicien />
      ) : (
        <MissionsListe missions={missions} readOnly afficherTechnicien />
      )}
    </div>
  )
}
