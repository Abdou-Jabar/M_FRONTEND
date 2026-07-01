"use client"

// Vue liste des missions avec filtres (méthode « traditionnelle »).
// Le technicien peut faire évoluer le statut via les boutons d'action.
// Le superviseur est en lecture seule.

import { useMemo, useState } from "react"
import { CheckCircle2, PlayCircle, RotateCcw } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  LIBELLE_STATUT,
  STATUTS_ORDONNES,
  type Affectation,
  type StatutMission,
} from "@/lib/affectations/types"

type FiltreStatut = StatutMission | "TOUS"

function formaterDate(valeur: string | null): string {
  if (!valeur) return "—"
  return new Date(valeur).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function BadgeStatut({ statut }: { statut: StatutMission }) {
  const classe: Record<StatutMission, string> = {
    A_DEMARRER: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    EN_COURS: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
    TERMINEE:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  }
  return (
    <Badge variant="outline" className={classe[statut]}>
      {LIBELLE_STATUT[statut]}
    </Badge>
  )
}

export function MissionsListe({
  missions,
  readOnly = false,
  afficherTechnicien = false,
  busyId,
  onStatutChange,
}: {
  missions: Affectation[]
  readOnly?: boolean
  afficherTechnicien?: boolean
  busyId?: number | null
  onStatutChange?: (mission: Affectation, statut: StatutMission) => void
}) {
  const [filtre, setFiltre] = useState<FiltreStatut>("TOUS")

  const filtrees = useMemo(() => {
    const base =
      filtre === "TOUS" ? missions : missions.filter((m) => m.statut === filtre)
    // Tri : à démarrer puis en cours puis terminées ; dans chaque groupe,
    // les plus récentes d'abord.
    const ordre: Record<StatutMission, number> = {
      A_DEMARRER: 0,
      EN_COURS: 1,
      TERMINEE: 2,
    }
    return [...base].sort((a, b) => {
      if (ordre[a.statut] !== ordre[b.statut]) {
        return ordre[a.statut] - ordre[b.statut]
      }
      return (
        new Date(b.dateAffectation).getTime() -
        new Date(a.dateAffectation).getTime()
      )
    })
  }, [missions, filtre])

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Filtrer :</span>
        <Select
          value={filtre}
          onValueChange={(v) => setFiltre(v as FiltreStatut)}
        >
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="TOUS">Tous les statuts</SelectItem>
            {STATUTS_ORDONNES.map((s) => (
              <SelectItem key={s} value={s}>
                {LIBELLE_STATUT[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Organisation</TableHead>
              {afficherTechnicien && <TableHead>Technicien</TableHead>}
              <TableHead>Statut</TableHead>
              <TableHead>Affectée</TableHead>
              <TableHead>Démarrée</TableHead>
              <TableHead>Terminée</TableHead>
              {!readOnly && <TableHead className="text-right">Action</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtrees.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-24 text-center text-sm text-muted-foreground"
                >
                  Aucune mission.
                </TableCell>
              </TableRow>
            ) : (
              filtrees.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">
                    {m.organisationNom}
                  </TableCell>
                  {afficherTechnicien && (
                    <TableCell className="text-muted-foreground">
                      {m.technicienNomComplet}
                    </TableCell>
                  )}
                  <TableCell>
                    <BadgeStatut statut={m.statut} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formaterDate(m.dateAffectation)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formaterDate(m.dateDebut)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formaterDate(m.dateFin)}
                  </TableCell>
                  {!readOnly && (
                    <TableCell className="text-right">
                      {m.statut === "A_DEMARRER" && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={busyId === m.id}
                          onClick={() => onStatutChange?.(m, "EN_COURS")}
                        >
                          <PlayCircle className="size-4" />
                          Démarrer
                        </Button>
                      )}
                      {m.statut === "EN_COURS" && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={busyId === m.id}
                          onClick={() => onStatutChange?.(m, "TERMINEE")}
                        >
                          <CheckCircle2 className="size-4" />
                          Terminer
                        </Button>
                      )}
                      {m.statut === "TERMINEE" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={busyId === m.id}
                          onClick={() => onStatutChange?.(m, "EN_COURS")}
                          className="text-muted-foreground"
                        >
                          <RotateCcw className="size-4" />
                          Rouvrir
                        </Button>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
