"use client"

// Vue self-service du technicien : ses missions, en kanban (glisser-déposer)
// ou en liste filtrable. Le technicien fait évoluer le statut de ses missions
// (À démarrer → En cours → Terminée) ; la date de démarrage et la date de fin
// sont enregistrées automatiquement.

import { useEffect, useState } from "react"
import { KanbanSquare, List } from "lucide-react"
import { toast } from "sonner"

import { Skeleton } from "@/components/ui/skeleton"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import { MissionsKanban } from "@/components/missions-kanban"
import { MissionsListe } from "@/components/missions-liste"
import { ApiError } from "@/lib/api"
import {
  changerStatutMission,
  getMesMissions,
} from "@/lib/affectations/affectation-service"
import {
  LIBELLE_STATUT,
  type Affectation,
  type StatutMission,
} from "@/lib/affectations/types"

type Vue = "kanban" | "liste"

export function MesMissions() {
  const [missions, setMissions] = useState<Affectation[]>([])
  const [vue, setVue] = useState<Vue>("kanban")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<number | null>(null)

  useEffect(() => {
    let actif = true
    getMesMissions()
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
            : "Impossible de charger vos missions.",
        )
      })
      .finally(() => {
        if (actif) setIsLoading(false)
      })
    return () => {
      actif = false
    }
  }, [])

  function handleStatutChange(mission: Affectation, statut: StatutMission) {
    if (busyId != null || mission.statut === statut) return
    setBusyId(mission.id)
    changerStatutMission(mission.id, statut)
      .then((updated) => {
        setMissions((prev) =>
          prev.map((m) => (m.id === updated.id ? updated : m)),
        )
        toast.success(
          `« ${mission.organisationNom} » → ${LIBELLE_STATUT[statut]}`,
        )
      })
      .catch((e) => {
        toast.error(
          e instanceof ApiError ? e.message : "Changement de statut impossible.",
        )
      })
      .finally(() => setBusyId(null))
  }

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
        <MissionsKanban
          missions={missions}
          onStatutChange={handleStatutChange}
        />
      ) : (
        <MissionsListe
          missions={missions}
          busyId={busyId}
          onStatutChange={handleStatutChange}
        />
      )}
    </div>
  )
}
