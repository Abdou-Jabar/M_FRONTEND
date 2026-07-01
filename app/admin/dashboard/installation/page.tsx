"use client"

// Espace technicien : flux d'installation sur les organisations assignées.
//
// Étapes :
//   1. Choisir une organisation parmi ses missions (affectations actives).
//   2. Choisir une parcelle déjà créée par l'admin de cette organisation.
//   3. Ajouter des dispositifs à cette parcelle, puis des capteurs à chaque
//      dispositif.
//
// Le technicien ne crée pas de parcelles : il installe le matériel sur des
// parcelles existantes. Les appels réseau sont déclenchés depuis les
// gestionnaires d'évènements (pas dans des effets) — seul le chargement initial
// des missions se fait dans un effet via une chaîne de promesse (lint-safe).

import { useEffect, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { DispositifForm } from "@/components/dispositif-form"
import { CapteurForm } from "@/components/capteur-form"
import { ApiError } from "@/lib/api"
import { getMesMissions } from "@/lib/affectations/affectation-service"
import type { Affectation } from "@/lib/affectations/types"
import { getParcellesByOrganisation } from "@/lib/parcelles/parcelle-service"
import {
  ENVIRONNEMENT_LABELS,
  type Parcelle,
} from "@/lib/parcelles/types"
import { getDispositifsByParcelle } from "@/lib/dispositifs/dispositif-service"
import {
  STATUT_DISPOSITIF_BADGE,
  STATUT_DISPOSITIF_LABELS,
  type Dispositif,
} from "@/lib/dispositifs/types"
import { getCapteursByDispositif } from "@/lib/capteurs/capteur-service"
import { TYPE_CAPTEUR_LABELS, type Capteur } from "@/lib/capteurs/types"

export default function InstallationPage() {
  // ── Missions (organisations assignées) ──────────────────────
  const [missions, setMissions] = useState<Affectation[]>([])
  const [missionsLoading, setMissionsLoading] = useState(true)
  const [missionsError, setMissionsError] = useState<string | null>(null)

  // ── Sélections en cascade ───────────────────────────────────
  const [orgId, setOrgId] = useState<string>("")
  const [parcelleId, setParcelleId] = useState<string>("")

  // ── Parcelles de l'organisation choisie ─────────────────────
  const [parcelles, setParcelles] = useState<Parcelle[]>([])
  const [parcellesLoading, setParcellesLoading] = useState(false)
  const [parcellesError, setParcellesError] = useState<string | null>(null)

  // ── Dispositifs de la parcelle choisie + capteurs par dispositif ──
  const [dispositifs, setDispositifs] = useState<Dispositif[]>([])
  const [dispositifsLoading, setDispositifsLoading] = useState(false)
  const [dispositifsError, setDispositifsError] = useState<string | null>(null)
  const [capteursParDispositif, setCapteursParDispositif] = useState<
    Record<number, Capteur[]>
  >({})

  // ── Affichage des formulaires d'ajout ───────────────────────
  const [ajoutDispositif, setAjoutDispositif] = useState(false)
  // dispositifId pour lequel le formulaire d'ajout de capteur est ouvert.
  const [ajoutCapteurPour, setAjoutCapteurPour] = useState<number | null>(null)

  // Chargement initial des missions.
  useEffect(() => {
    let actif = true
    getMesMissions()
      .then((data) => {
        // Le technicien ne peut installer du matériel que sur les missions
        // qu'il a démarrées (EN_COURS).
        if (actif) setMissions(data.filter((m) => m.statut === "EN_COURS"))
      })
      .catch((e) => {
        if (actif)
          setMissionsError(
            e instanceof ApiError
              ? e.message
              : "Impossible de charger vos missions.",
          )
      })
      .finally(() => {
        if (actif) setMissionsLoading(false)
      })
    return () => {
      actif = false
    }
  }, [])

  // Charge les parcelles d'une organisation.
  function chargerParcelles(organisationId: number) {
    setParcellesLoading(true)
    setParcellesError(null)
    getParcellesByOrganisation(organisationId)
      .then((data) => setParcelles(data))
      .catch((e) =>
        setParcellesError(
          e instanceof ApiError
            ? e.message
            : "Impossible de charger les parcelles.",
        ),
      )
      .finally(() => setParcellesLoading(false))
  }

  // Charge les dispositifs d'une parcelle + les capteurs de chacun.
  function chargerDispositifs(parcelleIdNum: number) {
    setDispositifsLoading(true)
    setDispositifsError(null)
    getDispositifsByParcelle(parcelleIdNum)
      .then(async (ds) => {
        const entrees = await Promise.all(
          ds.map((d) =>
            getCapteursByDispositif(d.id)
              .then((cs) => [d.id, cs] as const)
              .catch(() => [d.id, [] as Capteur[]] as const),
          ),
        )
        setDispositifs(ds)
        setCapteursParDispositif(Object.fromEntries(entrees))
      })
      .catch((e) =>
        setDispositifsError(
          e instanceof ApiError
            ? e.message
            : "Impossible de charger les dispositifs.",
        ),
      )
      .finally(() => setDispositifsLoading(false))
  }

  function handleOrgChange(value: string) {
    setOrgId(value)
    // Réinitialise l'aval.
    setParcelleId("")
    setParcelles([])
    setDispositifs([])
    setCapteursParDispositif({})
    setAjoutDispositif(false)
    setAjoutCapteurPour(null)
    chargerParcelles(Number(value))
  }

  function handleParcelleChange(value: string) {
    setParcelleId(value)
    setDispositifs([])
    setCapteursParDispositif({})
    setAjoutDispositif(false)
    setAjoutCapteurPour(null)
    chargerDispositifs(Number(value))
  }

  // Dispositif créé : on l'ajoute à la liste et on ferme le formulaire.
  function handleDispositifCree(d: Dispositif) {
    setDispositifs((prev) => [...prev, d])
    setCapteursParDispositif((prev) => ({ ...prev, [d.id]: [] }))
    setAjoutDispositif(false)
  }

  // Capteur créé : on l'ajoute sous son dispositif et on ferme le formulaire.
  function handleCapteurCree(c: Capteur) {
    setCapteursParDispositif((prev) => ({
      ...prev,
      [c.dispositifId]: [...(prev[c.dispositifId] ?? []), c],
    }))
    setAjoutCapteurPour(null)
  }

  const parcelleChoisie = parcelles.find((p) => String(p.id) === parcelleId)

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-semibold tracking-tight">Installation</h2>
        <p className="text-sm text-muted-foreground">
          Installez les dispositifs et capteurs sur les parcelles des
          organisations qui vous sont assignées.
        </p>
      </div>

      {/* État de chargement / erreur / aucune mission */}
      {missionsLoading ? (
        <p className="text-sm text-muted-foreground">Chargement des missions…</p>
      ) : missionsError ? (
        <p className="text-sm text-destructive">{missionsError}</p>
      ) : missions.length === 0 ? (
        <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          Aucune organisation ne vous est assignée pour le moment. Contactez
          votre superviseur.
        </div>
      ) : (
        <>
          {/* Étape 1 : organisation */}
          <Card>
            <CardHeader>
              <CardTitle>1. Organisation</CardTitle>
              <CardDescription>
                Choisissez l&apos;organisation où réaliser l&apos;installation.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Select value={orgId} onValueChange={handleOrgChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sélectionner une organisation" />
                </SelectTrigger>
                <SelectContent>
                  {missions.map((m) => (
                    <SelectItem
                      key={m.organisationId}
                      value={String(m.organisationId)}
                    >
                      {m.organisationNom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Étape 2 : parcelle */}
          {orgId ? (
            <Card>
              <CardHeader>
                <CardTitle>2. Parcelle</CardTitle>
                <CardDescription>
                  Sélectionnez une parcelle déjà créée par l&apos;administrateur
                  de l&apos;organisation.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                {parcellesLoading ? (
                  <p className="text-sm text-muted-foreground">
                    Chargement des parcelles…
                  </p>
                ) : parcellesError ? (
                  <p className="text-sm text-destructive">{parcellesError}</p>
                ) : parcelles.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Aucune parcelle disponible. L&apos;administrateur doit
                    d&apos;abord créer ses parcelles.
                  </p>
                ) : (
                  <Select
                    value={parcelleId}
                    onValueChange={handleParcelleChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sélectionner une parcelle" />
                    </SelectTrigger>
                    <SelectContent>
                      {parcelles.map((p) => (
                        <SelectItem key={p.id} value={String(p.id)}>
                          {p.nom} — {ENVIRONNEMENT_LABELS[p.environnement]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </CardContent>
            </Card>
          ) : null}

          {/* Étape 3 : matériel de la parcelle */}
          {parcelleChoisie ? (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2">
                <div className="flex flex-col gap-1">
                  <CardTitle>3. Matériel — {parcelleChoisie.nom}</CardTitle>
                  <CardDescription>
                    Ajoutez des dispositifs et leurs capteurs sur cette parcelle.
                  </CardDescription>
                </div>
                {!ajoutDispositif ? (
                  <Button size="sm" onClick={() => setAjoutDispositif(true)}>
                    Ajouter un dispositif
                  </Button>
                ) : null}
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {/* Formulaire d'ajout de dispositif */}
                {ajoutDispositif ? (
                  <div className="rounded-lg border p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <h4 className="text-sm font-medium">
                        Nouveau dispositif sur {parcelleChoisie.nom}
                      </h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setAjoutDispositif(false)}
                      >
                        Fermer
                      </Button>
                    </div>
                    <DispositifForm
                      parcelles={[parcelleChoisie]}
                      onSuccess={handleDispositifCree}
                    />
                  </div>
                ) : null}

                {/* Liste des dispositifs */}
                {dispositifsLoading ? (
                  <p className="text-sm text-muted-foreground">
                    Chargement des dispositifs…
                  </p>
                ) : dispositifsError ? (
                  <p className="text-sm text-destructive">{dispositifsError}</p>
                ) : dispositifs.length === 0 && !ajoutDispositif ? (
                  <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                    Aucun dispositif installé sur cette parcelle.
                  </p>
                ) : (
                  dispositifs.map((d) => {
                    const capteurs = capteursParDispositif[d.id] ?? []
                    return (
                      <div key={d.id} className="rounded-lg border p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{d.nom}</span>
                              <Badge variant={STATUT_DISPOSITIF_BADGE[d.statut]}>
                                {STATUT_DISPOSITIF_LABELS[d.statut]}
                              </Badge>
                            </div>
                            <span className="font-mono text-xs text-muted-foreground">
                              {d.adresseMac}
                            </span>
                          </div>
                          {ajoutCapteurPour !== d.id ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setAjoutCapteurPour(d.id)}
                            >
                              Ajouter un capteur
                            </Button>
                          ) : null}
                        </div>

                        <Separator className="my-3" />

                        {/* Capteurs du dispositif */}
                        {capteurs.length === 0 ? (
                          <p className="text-xs text-muted-foreground">
                            Aucun capteur sur ce dispositif.
                          </p>
                        ) : (
                          <ul className="flex flex-col gap-1">
                            {capteurs.map((c) => (
                              <li
                                key={c.id}
                                className="flex items-center justify-between text-sm"
                              >
                                <span>{c.nom}</span>
                                <span className="text-muted-foreground">
                                  {TYPE_CAPTEUR_LABELS[c.type]} · {c.unite}
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}

                        {/* Formulaire d'ajout de capteur */}
                        {ajoutCapteurPour === d.id ? (
                          <div className="mt-4 rounded-lg border bg-muted/30 p-4">
                            <div className="mb-4 flex items-center justify-between">
                              <h4 className="text-sm font-medium">
                                Nouveau capteur sur {d.nom}
                              </h4>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setAjoutCapteurPour(null)}
                              >
                                Fermer
                              </Button>
                            </div>
                            <CapteurForm
                              dispositifs={[d]}
                              onSuccess={handleCapteurCree}
                            />
                          </div>
                        ) : null}
                      </div>
                    )
                  })
                )}
              </CardContent>
            </Card>
          ) : null}
        </>
      )}
    </div>
  )
}
