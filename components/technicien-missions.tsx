"use client"

// Gestion des missions d'un technicien : organisations affectées.
// Le superviseur peut affecter une organisation ou en retirer.

import { useEffect, useState } from "react"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { ApiError } from "@/lib/api"
import {
  affecter,
  getAffectationsTechnicien,
  retirerAffectation,
} from "@/lib/affectations/affectation-service"
import type { Affectation } from "@/lib/affectations/types"
import { LIBELLE_STATUT } from "@/lib/affectations/types"
import { getOrganisations } from "@/lib/organisations/organisation-service"
import type { Organisation } from "@/lib/organisations/types"
import { getUtilisateur } from "@/lib/utilisateurs/utilisateur-service"

function formaterDate(valeur: string): string {
  return new Date(valeur).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

export function TechnicienMissions({ technicienId }: { technicienId: number }) {
  const [nom, setNom] = useState("")
  const [affectations, setAffectations] = useState<Affectation[]>([])
  const [organisations, setOrganisations] = useState<Organisation[]>([])
  const [choixOrg, setChoixOrg] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isBusy, setIsBusy] = useState(false)

  // En-tête : nom du technicien.
  useEffect(() => {
    let actif = true
    getUtilisateur(technicienId)
      .then((u) => {
        if (actif) setNom(`${u.prenom} ${u.nom}`)
      })
      .catch(() => {})
    return () => {
      actif = false
    }
  }, [technicienId])

  // Affectations + organisations actives.
  useEffect(() => {
    let actif = true
    Promise.all([
      getAffectationsTechnicien(technicienId),
      getOrganisations("ACTIVE"),
    ])
      .then(([aff, orgs]) => {
        if (!actif) return
        setAffectations(aff)
        setOrganisations(orgs)
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
  }, [technicienId])

  function recharger() {
    getAffectationsTechnicien(technicienId)
      .then(setAffectations)
      .catch(() => {})
  }

  const actives = affectations.filter((a) => a.active)
  const retirees = affectations.filter((a) => !a.active)
  const idsAffectes = new Set(actives.map((a) => a.organisationId))
  const orgsDisponibles = organisations.filter((o) => !idsAffectes.has(o.id))

  async function handleAffecter() {
    if (!choixOrg || isBusy) return
    setIsBusy(true)
    try {
      await affecter(technicienId, Number(choixOrg))
      toast.success("Organisation affectée au technicien.")
      setChoixOrg("")
      recharger()
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Affectation impossible.")
    } finally {
      setIsBusy(false)
    }
  }

  async function handleRetirer(a: Affectation) {
    setIsBusy(true)
    try {
      await retirerAffectation(a.id)
      toast.success(`Mission « ${a.organisationNom} » retirée.`)
      setAffectations((prev) =>
        prev.map((x) => (x.id === a.id ? { ...x, active: false } : x)),
      )
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Retrait impossible.")
    } finally {
      setIsBusy(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
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
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-semibold tracking-tight">
          Missions de {nom || "technicien"}
        </h2>
        <p className="text-sm text-muted-foreground">
          Organisations sur lesquelles ce technicien peut intervenir.
        </p>
      </div>

      {/* Affecter une nouvelle organisation */}
      <div className="flex flex-wrap items-end gap-2 rounded-xl border p-4">
        <div className="flex flex-1 flex-col gap-1">
          <span className="text-sm font-medium">Affecter une organisation</span>
          <Select value={choixOrg} onValueChange={setChoixOrg} disabled={isBusy}>
            <SelectTrigger className="w-full sm:w-80">
              <SelectValue
                placeholder={
                  orgsDisponibles.length === 0
                    ? "Aucune organisation disponible"
                    : "Sélectionner une organisation"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {orgsDisponibles.map((o) => (
                <SelectItem key={o.id} value={String(o.id)}>
                  {o.nom}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleAffecter} disabled={!choixOrg || isBusy}>
          Affecter
        </Button>
      </div>

      {/* Organisations assignées */}
      {actives.length === 0 ? (
        <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed p-8 text-sm text-muted-foreground">
          Aucune organisation assignée.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {actives.map((a) => (
            <div
              key={a.id}
              className="flex items-center justify-between rounded-xl border p-4"
            >
              <div className="flex items-center gap-3">
                <Badge>{a.organisationNom}</Badge>
                <span className="text-xs text-muted-foreground">
                  {LIBELLE_STATUT[a.statut]}
                  {a.statut === "TERMINEE" && a.dateFin
                    ? ` · le ${formaterDate(a.dateFin)}`
                    : ""}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRetirer(a)}
                disabled={isBusy}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="size-4" />
                Retirer
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Historique des affectations retirées */}
      {retirees.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-medium text-muted-foreground">
            Affectations retirées
          </h3>
          {retirees.map((a) => (
            <div
              key={a.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-dashed p-4"
            >
              <div className="flex items-center gap-3">
                <Badge variant="secondary">{a.organisationNom}</Badge>
              </div>
              <span className="text-xs text-muted-foreground">Retirée</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
