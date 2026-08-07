"use client"

// Gestion des seuils d'alerte par type de culture (superviseur).
// Un seuil = TypeCulture × Saison × Type de sol, avec plages agronomiques
// (humidité, température, pH, NPK min) utilisées pour déclencher les alertes.

import { useCallback, useEffect, useState } from "react"
import { MoreHorizontal, PencilIcon, Plus, RefreshCwIcon, SparklesIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ApiError } from "@/lib/api"
import { SAISON_LABELS, type Saison } from "@/lib/cultures/types"
import { TYPE_SOL_LABELS, TYPE_SOL_OPTIONS, type TypeSol } from "@/lib/parcelles/types"
import {
  ajouterSeuils,
  getSeuilsByTypeCulture,
  modifierSeuil,
  supprimerSeuil,
} from "@/lib/seuils/seuil-service"
import type { SeuilAlerte, SeuilAlerteRequest } from "@/lib/seuils/types"
import { getTypesCulture } from "@/lib/types-culture/type-culture-service"
import type { TypeCulture } from "@/lib/types-culture/types"

const SAISON_OPTIONS = (
  Object.keys(SAISON_LABELS) as Saison[]
).map((value) => ({ value, label: SAISON_LABELS[value] }))

// État du formulaire (champs numériques en texte pour la saisie).
interface FormSeuil {
  saison: Saison | ""
  typeSol: TypeSol | ""
  humiditeMin: string
  humiditeMax: string
  temperatureMin: string
  temperatureMax: string
  phMin: string
  phMax: string
  npkAzoteMin: string
  npkPhosphoreMin: string
  npkPotassiumMin: string
}

const FORM_VIDE: FormSeuil = {
  saison: "",
  typeSol: "",
  humiditeMin: "",
  humiditeMax: "",
  temperatureMin: "",
  temperatureMax: "",
  phMin: "",
  phMax: "",
  npkAzoteMin: "",
  npkPhosphoreMin: "",
  npkPotassiumMin: "",
}

export function SeuilsManager() {
  const [typesCulture, setTypesCulture] = useState<TypeCulture[]>([])
  const [typeCultureId, setTypeCultureId] = useState<string>("")
  const [seuils, setSeuils] = useState<SeuilAlerte[]>([])
  const [isLoadingTypes, setIsLoadingTypes] = useState(true)
  const [isLoadingSeuils, setIsLoadingSeuils] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Sheet création/édition
  const [sheetOuvert, setSheetOuvert] = useState(false)
  const [seuilEnEdition, setSeuilEnEdition] = useState<SeuilAlerte | null>(null)
  const [form, setForm] = useState<FormSeuil>(FORM_VIDE)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Suppression
  const [seuilASupprimer, setSeuilASupprimer] = useState<SeuilAlerte | null>(null)

  const typeCultureCourant = typesCulture.find(
    (t) => String(t.id) === typeCultureId,
  )

  // Charge le catalogue, sélectionne le premier type par défaut.
  const chargerTypes = useCallback(() => {
    setIsLoadingTypes(true)
    setError(null)
    getTypesCulture()
      .then((data) => {
        setTypesCulture(data)
        if (data.length > 0) {
          setTypeCultureId((prev) => (prev === "" ? String(data[0].id) : prev))
        }
      })
      .catch((e) =>
        setError(
          e instanceof ApiError
            ? e.message
            : "Impossible de charger les types de culture.",
        ),
      )
      .finally(() => setIsLoadingTypes(false))
  }, [])

  useEffect(() => {
    chargerTypes()
  }, [chargerTypes])

  // Charge les seuils du type sélectionné.
  useEffect(() => {
    if (typeCultureId === "") return
    let actif = true
    setIsLoadingSeuils(true)
    getSeuilsByTypeCulture(Number(typeCultureId))
      .then((data) => { if (actif) setSeuils(data) })
      .catch((e) => {
        if (!actif) return
        toast.error(
          e instanceof ApiError
            ? e.message
            : "Impossible de charger les seuils.",
        )
      })
      .finally(() => { if (actif) setIsLoadingSeuils(false) })
    return () => { actif = false }
  }, [typeCultureId])

  function setChamp<K extends keyof FormSeuil>(champ: K, valeur: FormSeuil[K]) {
    setForm((prev) => ({ ...prev, [champ]: valeur }))
  }

  function ouvrirCreation() {
    setSeuilEnEdition(null)
    setForm(FORM_VIDE)
    setSheetOuvert(true)
  }

  function ouvrirEdition(seuil: SeuilAlerte) {
    setSeuilEnEdition(seuil)
    setForm({
      saison: seuil.saison,
      typeSol: seuil.typeSol ?? "",
      humiditeMin: String(seuil.humiditeMin),
      humiditeMax: String(seuil.humiditeMax),
      temperatureMin: String(seuil.temperatureMin),
      temperatureMax: String(seuil.temperatureMax),
      phMin: String(seuil.phMin),
      phMax: String(seuil.phMax),
      npkAzoteMin: String(seuil.npkAzoteMin),
      npkPhosphoreMin: String(seuil.npkPhosphoreMin),
      npkPotassiumMin: String(seuil.npkPotassuimMin),
    })
    setSheetOuvert(true)
  }

  // Valide le formulaire et construit la requête. Retourne null si invalide.
  function construireRequete(): SeuilAlerteRequest | null {
    if (!typeCultureCourant) return null
    if (form.saison === "" || form.typeSol === "") {
      toast.error("La saison et le type de sol sont obligatoires.")
      return null
    }

    const nombres = {
      humiditeMin: Number(form.humiditeMin),
      humiditeMax: Number(form.humiditeMax),
      temperatureMin: Number(form.temperatureMin),
      temperatureMax: Number(form.temperatureMax),
      phMin: Number(form.phMin),
      phMax: Number(form.phMax),
      npkAzoteMin: Number(form.npkAzoteMin),
      npkPhosphoreMin: Number(form.npkPhosphoreMin),
      npkPotassiumMin: Number(form.npkPotassiumMin),
    }

    if (Object.values(nombres).some((n) => Number.isNaN(n))) {
      toast.error("Tous les seuils doivent être renseignés (valeurs numériques).")
      return null
    }
    if (nombres.humiditeMin >= nombres.humiditeMax) {
      toast.error("L'humidité min doit être inférieure à l'humidité max.")
      return null
    }
    if (nombres.temperatureMin >= nombres.temperatureMax) {
      toast.error("La température min doit être inférieure à la température max.")
      return null
    }
    if (nombres.phMin >= nombres.phMax) {
      toast.error("Le pH min doit être inférieur au pH max.")
      return null
    }
    if (nombres.phMin < 0 || nombres.phMax > 14) {
      toast.error("Le pH doit être compris entre 0 et 14.")
      return null
    }
    if (nombres.humiditeMin < 0 || nombres.humiditeMax > 100) {
      toast.error("L'humidité doit être comprise entre 0 et 100 %.")
      return null
    }

    return {
      nomCulture: `${typeCultureCourant.nom} — ${SAISON_LABELS[form.saison]} / ${TYPE_SOL_LABELS[form.typeSol]}`,
      humiditeMin: nombres.humiditeMin,
      humiditeMax: nombres.humiditeMax,
      temperatureMin: nombres.temperatureMin,
      temperatureMax: nombres.temperatureMax,
      phMin: nombres.phMin,
      phMax: nombres.phMax,
      npkAzoteMin: nombres.npkAzoteMin,
      npkPhosphoreMin: nombres.npkPhosphoreMin,
      npkPotassuimMin: nombres.npkPotassiumMin,
      saison: form.saison,
      typeSol: form.typeSol,
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (isSubmitting) return

    const requete = construireRequete()
    if (!requete) return

    setIsSubmitting(true)
    try {
      if (seuilEnEdition) {
        const maj = await modifierSeuil(seuilEnEdition.id, requete)
        setSeuils((prev) => prev.map((s) => (s.id === maj.id ? maj : s)))
        toast.success("Seuil modifié.")
      } else {
        const crees = await ajouterSeuils(Number(typeCultureId), [requete])
        setSeuils((prev) => [...prev, ...crees])
        toast.success("Seuil créé.")
      }
      setSheetOuvert(false)
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : "Opération impossible.",
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleSupprimer() {
    if (!seuilASupprimer) return
    try {
      await supprimerSeuil(seuilASupprimer.id)
      setSeuils((prev) => prev.filter((s) => s.id !== seuilASupprimer.id))
      toast.success("Seuil supprimé.")
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : "Suppression impossible.",
      )
    } finally {
      setSeuilASupprimer(null)
    }
  }

  if (isLoadingTypes) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-10 text-sm text-muted-foreground">
        <p>{error}</p>
        <Button variant="outline" size="sm" onClick={chargerTypes}>
          <RefreshCwIcon className="size-4" />
          Réessayer
        </Button>
      </div>
    )
  }

  if (typesCulture.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-10 text-sm text-muted-foreground">
        <p>
          Créez d&apos;abord un type de culture dans l&apos;onglet
          « Types de culture ».
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Sélecteur de type de culture + bouton créer */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Select value={typeCultureId} onValueChange={setTypeCultureId}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Type de culture" />
          </SelectTrigger>
          <SelectContent>
            {typesCulture.map((t) => (
              <SelectItem key={t.id} value={String(t.id)}>
                {t.nom} ({t.variete})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button size="sm" onClick={ouvrirCreation}>
          <Plus className="size-4" />
          Nouveau seuil
        </Button>
      </div>

      {/* Table des seuils */}
      {isLoadingSeuils ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-xl" />
          ))}
        </div>
      ) : seuils.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-10 text-sm text-muted-foreground">
          <p>
            Aucun seuil configuré pour «{" "}
            {typeCultureCourant?.nom} ({typeCultureCourant?.variete}) ».
          </p>
          <Button size="sm" variant="outline" onClick={ouvrirCreation}>
            <Plus className="size-4" />
            Configurer un seuil
          </Button>
        </div>
      ) : (
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Saison</TableHead>
                <TableHead>Type de sol</TableHead>
                <TableHead>Humidité</TableHead>
                <TableHead>Température</TableHead>
                <TableHead>pH</TableHead>
                <TableHead className="hidden lg:table-cell">NPK min (N/P/K)</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {seuils.map((seuil) => (
                <TableRow key={seuil.id}>
                  <TableCell>
                    <Badge variant="outline">
                      {SAISON_LABELS[seuil.saison]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1.5">
                      {seuil.typeSol ? TYPE_SOL_LABELS[seuil.typeSol] : "—"}
                      {seuil.estGenereParIA && (
                        <Badge variant="secondary" className="gap-1">
                          <SparklesIcon className="size-3" />
                          IA
                        </Badge>
                      )}
                    </span>
                  </TableCell>
                  <TableCell>
                    {seuil.humiditeMin}–{seuil.humiditeMax} %
                  </TableCell>
                  <TableCell>
                    {seuil.temperatureMin}–{seuil.temperatureMax} °C
                  </TableCell>
                  <TableCell>
                    {seuil.phMin}–{seuil.phMax}
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground lg:table-cell">
                    {seuil.npkAzoteMin} / {seuil.npkPhosphoreMin} /{" "}
                    {seuil.npkPotassuimMin} mg/kg
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onSelect={(e) => {
                            e.preventDefault()
                            ouvrirEdition(seuil)
                          }}
                        >
                          <PencilIcon className="size-4" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onSelect={(e) => {
                            e.preventDefault()
                            setSeuilASupprimer(seuil)
                          }}
                        >
                          <Trash2Icon className="size-4" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Sheet création / édition */}
      <Sheet open={sheetOuvert} onOpenChange={setSheetOuvert}>
        <SheetContent className="overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>
              {seuilEnEdition ? "Modifier le seuil" : "Nouveau seuil"}
            </SheetTitle>
            <SheetDescription>
              {typeCultureCourant
                ? `${typeCultureCourant.nom} (${typeCultureCourant.variete}) — un seuil par saison et type de sol.`
                : ""}
            </SheetDescription>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="flex flex-1 flex-col px-4">
            <FieldGroup>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="seuil-saison">Saison</FieldLabel>
                  <Select
                    value={form.saison}
                    onValueChange={(v) => setChamp("saison", v as Saison)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger id="seuil-saison">
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      {SAISON_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel htmlFor="seuil-sol">Type de sol</FieldLabel>
                  <Select
                    value={form.typeSol}
                    onValueChange={(v) => setChamp("typeSol", v as TypeSol)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger id="seuil-sol">
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      {TYPE_SOL_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="seuil-hmin">Humidité min (%)</FieldLabel>
                  <Input
                    id="seuil-hmin"
                    type="number"
                    step="0.1"
                    required
                    value={form.humiditeMin}
                    onChange={(e) => setChamp("humiditeMin", e.target.value)}
                    disabled={isSubmitting}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="seuil-hmax">Humidité max (%)</FieldLabel>
                  <Input
                    id="seuil-hmax"
                    type="number"
                    step="0.1"
                    required
                    value={form.humiditeMax}
                    onChange={(e) => setChamp("humiditeMax", e.target.value)}
                    disabled={isSubmitting}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="seuil-tmin">Température min (°C)</FieldLabel>
                  <Input
                    id="seuil-tmin"
                    type="number"
                    step="0.1"
                    required
                    value={form.temperatureMin}
                    onChange={(e) => setChamp("temperatureMin", e.target.value)}
                    disabled={isSubmitting}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="seuil-tmax">Température max (°C)</FieldLabel>
                  <Input
                    id="seuil-tmax"
                    type="number"
                    step="0.1"
                    required
                    value={form.temperatureMax}
                    onChange={(e) => setChamp("temperatureMax", e.target.value)}
                    disabled={isSubmitting}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="seuil-phmin">pH min</FieldLabel>
                  <Input
                    id="seuil-phmin"
                    type="number"
                    step="0.1"
                    min={0}
                    max={14}
                    required
                    value={form.phMin}
                    onChange={(e) => setChamp("phMin", e.target.value)}
                    disabled={isSubmitting}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="seuil-phmax">pH max</FieldLabel>
                  <Input
                    id="seuil-phmax"
                    type="number"
                    step="0.1"
                    min={0}
                    max={14}
                    required
                    value={form.phMax}
                    onChange={(e) => setChamp("phMax", e.target.value)}
                    disabled={isSubmitting}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <Field>
                  <FieldLabel htmlFor="seuil-n">Azote min</FieldLabel>
                  <Input
                    id="seuil-n"
                    type="number"
                    step="0.1"
                    required
                    value={form.npkAzoteMin}
                    onChange={(e) => setChamp("npkAzoteMin", e.target.value)}
                    disabled={isSubmitting}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="seuil-p">Phosphore min</FieldLabel>
                  <Input
                    id="seuil-p"
                    type="number"
                    step="0.1"
                    required
                    value={form.npkPhosphoreMin}
                    onChange={(e) => setChamp("npkPhosphoreMin", e.target.value)}
                    disabled={isSubmitting}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="seuil-k">Potassium min</FieldLabel>
                  <Input
                    id="seuil-k"
                    type="number"
                    step="0.1"
                    required
                    value={form.npkPotassiumMin}
                    onChange={(e) => setChamp("npkPotassiumMin", e.target.value)}
                    disabled={isSubmitting}
                  />
                </Field>
              </div>
            </FieldGroup>
            <SheetFooter className="mt-auto px-0">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Enregistrement…"
                  : seuilEnEdition
                    ? "Enregistrer"
                    : "Créer le seuil"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setSheetOuvert(false)}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      {/* Confirmation suppression */}
      <AlertDialog
        open={seuilASupprimer !== null}
        onOpenChange={(open) => { if (!open) setSeuilASupprimer(null) }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce seuil ?</AlertDialogTitle>
            <AlertDialogDescription>
              Le seuil «{" "}
              {seuilASupprimer
                ? `${SAISON_LABELS[seuilASupprimer.saison]} / ${seuilASupprimer.typeSol ? TYPE_SOL_LABELS[seuilASupprimer.typeSol] : "—"}`
                : ""}{" "}
              » ne sera plus appliqué aux nouvelles cultures. La suppression
              est refusée s&apos;il est utilisé par une culture en cours.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleSupprimer}>
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
