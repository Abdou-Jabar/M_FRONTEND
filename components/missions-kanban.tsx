"use client"

// Kanban des missions (À démarrer / En cours / Terminée).
// - Technicien : glisser-déposer une carte d'une colonne à l'autre fait
//   évoluer le statut de la mission (via onStatutChange).
// - Superviseur : mode lecture seule (pas de glisser-déposer).
// La colonne « Terminée » est filtrée par semaine pour éviter l'accumulation ;
// les colonnes « À démarrer » et « En cours » montrent toujours le travail en
// attente, quelle que soit la semaine sélectionnée.

import { useMemo, useState } from "react"
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import { Building2, ChevronLeft, ChevronRight, GripVertical } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  LIBELLE_STATUT,
  STATUTS_ORDONNES,
  type Affectation,
  type StatutMission,
} from "@/lib/affectations/types"
import {
  dansLaSemaine,
  decalerSemaine,
  libelleSemaine,
  memeSemaine,
  semaineDe,
  type Semaine,
} from "@/lib/affectations/semaine"

function formaterDate(valeur: string | null): string {
  if (!valeur) return "—"
  return new Date(valeur).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

// Couleur d'accent par statut (bord supérieur des colonnes).
const ACCENT: Record<StatutMission, string> = {
  A_DEMARRER: "border-t-slate-400",
  EN_COURS: "border-t-amber-500",
  TERMINEE: "border-t-emerald-500",
}

function texteDateCarte(mission: Affectation): string {
  switch (mission.statut) {
    case "A_DEMARRER":
      return `Affectée le ${formaterDate(mission.dateAffectation)}`
    case "EN_COURS":
      return `Démarrée le ${formaterDate(mission.dateDebut)}`
    case "TERMINEE":
      return `Terminée le ${formaterDate(mission.dateFin)}`
  }
}

function CarteMission({
  mission,
  afficherTechnicien,
  readOnly,
  overlay,
}: {
  mission: Affectation
  afficherTechnicien?: boolean
  readOnly?: boolean
  overlay?: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: String(mission.id),
      data: { statut: mission.statut },
      disabled: readOnly,
    })

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-start gap-2 rounded-lg border bg-card p-3 shadow-sm",
        !readOnly && "cursor-grab active:cursor-grabbing",
        isDragging && !overlay && "opacity-40",
        overlay && "shadow-lg",
      )}
    >
      {!readOnly && (
        <button
          type="button"
          className="mt-0.5 text-muted-foreground/60 hover:text-muted-foreground"
          {...listeners}
          {...attributes}
          aria-label="Déplacer la mission"
        >
          <GripVertical className="size-4" />
        </button>
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center gap-2">
          <Building2 className="size-4 shrink-0 text-muted-foreground" />
          <span className="truncate font-medium">{mission.organisationNom}</span>
        </div>
        {afficherTechnicien && (
          <span className="truncate text-xs text-muted-foreground">
            {mission.technicienNomComplet}
          </span>
        )}
        <span className="text-xs text-muted-foreground">
          {texteDateCarte(mission)}
        </span>
      </div>
    </div>
  )
}

function Colonne({
  statut,
  missions,
  afficherTechnicien,
  readOnly,
  children,
}: {
  statut: StatutMission
  missions: Affectation[]
  afficherTechnicien?: boolean
  readOnly?: boolean
  children?: React.ReactNode
}) {
  const { setNodeRef, isOver } = useDroppable({ id: statut })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex min-h-64 flex-1 flex-col gap-3 rounded-xl border border-t-4 bg-muted/30 p-3 transition-colors",
        ACCENT[statut],
        isOver && !readOnly && "bg-muted/70 ring-2 ring-primary/30",
      )}
    >
      <div className="flex items-center justify-between px-1">
        <span className="text-sm font-semibold">{LIBELLE_STATUT[statut]}</span>
        <Badge variant="secondary">{missions.length}</Badge>
      </div>
      {children}
      <div className="flex flex-col gap-2">
        {missions.map((m) => (
          <CarteMission
            key={m.id}
            mission={m}
            afficherTechnicien={afficherTechnicien}
            readOnly={readOnly}
          />
        ))}
        {missions.length === 0 && (
          <div className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">
            Aucune mission
          </div>
        )}
      </div>
    </div>
  )
}

export function MissionsKanban({
  missions,
  readOnly = false,
  afficherTechnicien = false,
  onStatutChange,
}: {
  missions: Affectation[]
  readOnly?: boolean
  afficherTechnicien?: boolean
  onStatutChange?: (mission: Affectation, statut: StatutMission) => void
}) {
  const [semaine, setSemaine] = useState<Semaine>(() => semaineDe(new Date()))
  const [activeId, setActiveId] = useState<number | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  )

  // Répartition des missions par colonne.
  const parStatut = useMemo(() => {
    const groupes: Record<StatutMission, Affectation[]> = {
      A_DEMARRER: [],
      EN_COURS: [],
      TERMINEE: [],
    }
    for (const m of missions) {
      if (m.statut === "TERMINEE") {
        // Filtrage par semaine sur la date de fin.
        if (dansLaSemaine(m.dateFin, semaine)) groupes.TERMINEE.push(m)
      } else {
        groupes[m.statut].push(m)
      }
    }
    return groupes
  }, [missions, semaine])

  const semaineCourante = memeSemaine(semaine, semaineDe(new Date()))
  const activeMission = missions.find((m) => m.id === activeId) ?? null

  function handleDragStart(event: DragStartEvent) {
    setActiveId(Number(event.active.id))
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null)
    const { active, over } = event
    if (!over || readOnly || !onStatutChange) return
    const mission = missions.find((m) => m.id === Number(active.id))
    if (!mission) return
    const cible = over.id as StatutMission
    if (cible !== mission.statut) {
      onStatutChange(mission, cible)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Sélecteur de semaine (filtre la colonne Terminée) */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border p-3">
        <div className="flex flex-col">
          <span className="text-sm font-medium">
            Semaine du {libelleSemaine(semaine)}
          </span>
          <span className="text-xs text-muted-foreground">
            La semaine filtre les missions terminées.
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSemaine((s) => decalerSemaine(s, -1))}
            aria-label="Semaine précédente"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={semaineCourante}
            onClick={() => setSemaine(semaineDe(new Date()))}
          >
            Cette semaine
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSemaine((s) => decalerSemaine(s, 1))}
            aria-label="Semaine suivante"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid gap-3 md:grid-cols-3">
          {STATUTS_ORDONNES.map((statut) => (
            <Colonne
              key={statut}
              statut={statut}
              missions={parStatut[statut]}
              afficherTechnicien={afficherTechnicien}
              readOnly={readOnly}
            />
          ))}
        </div>
        <DragOverlay>
          {activeMission ? (
            <CarteMission
              mission={activeMission}
              afficherTechnicien={afficherTechnicien}
              overlay
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
