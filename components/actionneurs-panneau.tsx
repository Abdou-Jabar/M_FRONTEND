"use client"

// Panneau de gestion des actionneurs d'un dispositif :
// - liste des actionneurs avec leur état (confirmé par ACK MQTT) ;
// - commande manuelle ON/OFF ;
// - activation/désactivation de la régulation automatique par seuils
//   min/max (mode auto) ;
// - ajout / suppression d'un actionneur ;
// - historique des commandes (manuelles et automatiques).
//
// L'état affiché est rafraîchi périodiquement : une commande renvoie
// 202 Accepted et l'état réel n'est mis à jour qu'à réception de l'ACK
// de l'ESP32 (AckHandler côté backend).

import { useCallback, useEffect, useState } from "react"
import {
  DropletsIcon,
  FanIcon,
  HistoryIcon,
  LightbulbIcon,
  PlusIcon,
  PowerIcon,
  PowerOffIcon,
  Trash2Icon,
  WavesIcon,
  type LucideIcon,
} from "lucide-react"
import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ApiError } from "@/lib/api"
import {
  changerModeAuto,
  creerActionneur,
  envoyerCommande,
  getActionneursByDispositif,
  getActionneursByParcelle,
  getHistoriqueCommandes,
  supprimerActionneur,
} from "@/lib/actionneurs/actionneur-service"
import {
  ORIGINE_COMMANDE_LABELS,
  TYPE_ACTIONNEUR_LABELS,
  type Actionneur,
  type CommandeActionneur,
  type TypeActionneur,
} from "@/lib/actionneurs/types"
import { useAuth } from "@/lib/auth/use-auth"

const ICONES: Record<TypeActionneur, LucideIcon> = {
  POMPE_IRRIGATION: DropletsIcon,
  VENTILATEUR: FanIcon,
  ECLAIRAGE: LightbulbIcon,
  VANNE_EAU: WavesIcon,
}

function formaterDate(valeur: string | null): string {
  if (!valeur) return "—"
  const date = new Date(valeur)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleString("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  })
}

// Panneau utilisable depuis un dispositif (gestion complète : ajout,
// suppression, pilotage) ou depuis une parcelle (pilotage seul, tous
// dispositifs confondus).
type ActionneursPanneauProps =
  | { dispositifId: number; parcelleId?: undefined }
  | { parcelleId: number; dispositifId?: undefined }

export function ActionneursPanneau({
  dispositifId,
  parcelleId,
}: ActionneursPanneauProps) {
  const modeParcelle = parcelleId != null
  const { user } = useAuth()
  const [actionneurs, setActionneurs] = useState<Actionneur[]>([])
  const [loading, setLoading] = useState(true)

  // Ajout
  const [ajoutOuvert, setAjoutOuvert] = useState(false)
  const [nom, setNom] = useState("")
  const [type, setType] = useState<TypeActionneur | "">("")
  const [enregistrement, setEnregistrement] = useState(false)

  // Historique
  const [historiqueDe, setHistoriqueDe] = useState<Actionneur | null>(null)
  const [historique, setHistorique] = useState<CommandeActionneur[]>([])
  const [historiqueLoading, setHistoriqueLoading] = useState(false)

  // Commande en cours (id de l'actionneur) pour désactiver les boutons.
  const [commandeEnCours, setCommandeEnCours] = useState<number | null>(null)

  const rafraichir = useCallback(() => {
    const promesse =
      parcelleId != null
        ? getActionneursByParcelle(parcelleId)
        : getActionneursByDispositif(dispositifId as number)
    return promesse.then(setActionneurs).catch(() => {})
  }, [dispositifId, parcelleId])

  // Chargement initial + rafraîchissement périodique (état ACK,
  // régulation automatique par seuils, extinction pluie…). `loading` est
  // true au montage (useState), pas besoin de le re-poser dans l'effet.
  useEffect(() => {
    let actif = true
    const promesse =
      parcelleId != null
        ? getActionneursByParcelle(parcelleId)
        : getActionneursByDispositif(dispositifId as number)
    promesse
      .then((data) => {
        if (actif) setActionneurs(data)
      })
      .catch(() => {})
      .finally(() => {
        if (actif) setLoading(false)
      })

    const timer = setInterval(rafraichir, 15_000)
    return () => {
      actif = false
      clearInterval(timer)
    }
  }, [dispositifId, parcelleId, rafraichir])

  // ── Actions ────────────────────────────────────────────────

  async function commander(actionneur: Actionneur, etatDemande: boolean) {
    if (!user) return
    setCommandeEnCours(actionneur.id)
    try {
      await envoyerCommande(actionneur.id, {
        etatDemande,
        utilisateurId: user.utilisateurId,
      })
      toast.success(
        `Commande envoyée : ${actionneur.nom} → ${etatDemande ? "activation" : "extinction"}. ` +
          "L'état sera confirmé par le dispositif.",
      )
      // L'ACK arrive en général en moins de 2 s : re-lire peu après.
      setTimeout(rafraichir, 3_000)
    } catch (e) {
      toast.error(
        e instanceof ApiError ? e.message : "Échec de l'envoi de la commande.",
      )
    } finally {
      setCommandeEnCours(null)
    }
  }

  async function basculerModeAuto(actionneur: Actionneur) {
    try {
      const maj = await changerModeAuto(actionneur.id, !actionneur.modeAuto)
      setActionneurs((liste) =>
        liste.map((a) => (a.id === maj.id ? maj : a)),
      )
      toast.success(
        `Régulation automatique ${maj.modeAuto ? "activée" : "désactivée"} pour ${maj.nom}.`,
      )
    } catch (e) {
      toast.error(
        e instanceof ApiError ? e.message : "Échec du changement de mode.",
      )
    }
  }

  async function ajouter() {
    if (dispositifId == null) return
    if (!nom.trim()) {
      toast.error("Veuillez saisir un nom.")
      return
    }
    if (!type) {
      toast.error("Veuillez sélectionner un type d'actionneur.")
      return
    }
    setEnregistrement(true)
    try {
      const cree = await creerActionneur({ nom: nom.trim(), type, dispositifId })
      toast.success(`Actionneur « ${cree.nom} » créé avec succès.`)
      setAjoutOuvert(false)
      setNom("")
      setType("")
      rafraichir()
    } catch (e) {
      toast.error(
        e instanceof ApiError ? e.message : "Échec de la création.",
      )
    } finally {
      setEnregistrement(false)
    }
  }

  async function supprimer(actionneur: Actionneur) {
    try {
      await supprimerActionneur(actionneur.id)
      toast.success(`Actionneur « ${actionneur.nom} » supprimé.`)
      rafraichir()
    } catch (e) {
      toast.error(
        e instanceof ApiError ? e.message : "Échec de la suppression.",
      )
    }
  }

  async function ouvrirHistorique(actionneur: Actionneur) {
    setHistoriqueDe(actionneur)
    setHistoriqueLoading(true)
    try {
      setHistorique(await getHistoriqueCommandes(actionneur.id))
    } catch {
      setHistorique([])
    } finally {
      setHistoriqueLoading(false)
    }
  }

  // ── Rendu ──────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-48 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold tracking-tight">Actionneurs</h3>
        {!modeParcelle && (
          <Button size="sm" onClick={() => setAjoutOuvert(true)}>
            <PlusIcon className="size-4" />
            Ajouter un actionneur
          </Button>
        )}
      </div>

      {actionneurs.length === 0 ? (
        <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed p-8 text-sm text-muted-foreground">
          {modeParcelle
            ? "Aucun actionneur installé sur cette parcelle."
            : "Aucun actionneur installé sur ce dispositif."}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {actionneurs.map((a) => (
            <CarteActionneur
              key={a.id}
              actionneur={a}
              enCours={commandeEnCours === a.id}
              modeParcelle={modeParcelle}
              onCommander={commander}
              onBasculerModeAuto={basculerModeAuto}
              onSupprimer={supprimer}
              onHistorique={ouvrirHistorique}
            />
          ))}
        </div>
      )}

      {/* ── Sheet d'ajout ─────────────────────────────────── */}
      <Sheet open={ajoutOuvert} onOpenChange={setAjoutOuvert}>
        <SheetContent className="flex flex-col gap-4">
          <SheetHeader>
            <SheetTitle>Nouvel actionneur</SheetTitle>
            <SheetDescription>
              L&apos;actionneur doit être physiquement raccordé au dispositif
              pour répondre aux commandes.
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-4 px-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="actionneur-nom">Nom</Label>
              <Input
                id="actionneur-nom"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                placeholder="Pompe principale"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Type</Label>
              <Select
                value={type}
                onValueChange={(v) => setType(v as TypeActionneur)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  {(
                    Object.keys(TYPE_ACTIONNEUR_LABELS) as TypeActionneur[]
                  ).map((t) => (
                    <SelectItem key={t} value={t}>
                      {TYPE_ACTIONNEUR_LABELS[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={ajouter} disabled={enregistrement}>
              {enregistrement ? "Création…" : "Créer l'actionneur"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* ── Sheet historique ──────────────────────────────── */}
      <Sheet
        open={historiqueDe !== null}
        onOpenChange={(open) => {
          if (!open) setHistoriqueDe(null)
        }}
      >
        <SheetContent className="flex w-full flex-col gap-4 sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>
              Historique — {historiqueDe?.nom}
            </SheetTitle>
            <SheetDescription>
              Commandes confirmées par le dispositif (manuelles et
              automatiques).
            </SheetDescription>
          </SheetHeader>
          <div className="overflow-y-auto px-4 pb-4">
            {historiqueLoading ? (
              <div className="flex flex-col gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : historique.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Aucune commande enregistrée.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Origine</TableHead>
                    <TableHead>Par</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historique.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="whitespace-nowrap tabular-nums">
                        {formaterDate(c.dateCommande)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={c.etatDemande ? "default" : "secondary"}
                        >
                          {c.etatDemande ? "Allumé" : "Éteint"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {ORIGINE_COMMANDE_LABELS[c.origine] ?? c.origine}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {c.utilisateurNomComplet ?? "Système"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

// ─── Carte d'un actionneur ───────────────────────────────────

interface CarteActionneurProps {
  actionneur: Actionneur
  enCours: boolean
  // Vue parcelle : pilotage seul (pas de suppression) + dispositif affiché.
  modeParcelle: boolean
  onCommander: (a: Actionneur, etatDemande: boolean) => void
  onBasculerModeAuto: (a: Actionneur) => void
  onSupprimer: (a: Actionneur) => void
  onHistorique: (a: Actionneur) => void
}

function CarteActionneur({
  actionneur: a,
  enCours,
  modeParcelle,
  onCommander,
  onBasculerModeAuto,
  onSupprimer,
  onHistorique,
}: CarteActionneurProps) {
  const Icone = ICONES[a.type] ?? PowerIcon

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div
            className={
              "flex size-10 items-center justify-center rounded-lg " +
              (a.etatActuel
                ? "bg-primary/10 text-primary"
                : "bg-muted text-muted-foreground")
            }
          >
            <Icone className="size-5" />
          </div>
          <div>
            <CardTitle className="text-base">{a.nom}</CardTitle>
            <p className="text-xs text-muted-foreground">
              {TYPE_ACTIONNEUR_LABELS[a.type]}
              {modeParcelle ? ` · ${a.dispositifNom}` : ""}
            </p>
          </div>
        </div>
        <Badge variant={a.etatActuel ? "default" : "secondary"}>
          {a.etatActuel ? "Allumé" : "Éteint"}
        </Badge>
      </CardHeader>

      <CardContent className="flex flex-col gap-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Régulation auto</span>
          <Button
            variant={a.modeAuto ? "default" : "outline"}
            size="sm"
            className="h-7"
            onClick={() => onBasculerModeAuto(a)}
          >
            {a.modeAuto ? "Activée" : "Désactivée"}
          </Button>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Dernière activation</span>
          <span className="tabular-nums">
            {formaterDate(a.dernireActivation)}
          </span>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between gap-2">
        {a.etatActuel ? (
          <Button
            variant="destructive"
            size="sm"
            disabled={enCours}
            onClick={() => onCommander(a, false)}
          >
            <PowerOffIcon className="size-4" />
            {enCours ? "Envoi…" : "Éteindre"}
          </Button>
        ) : (
          <Button
            size="sm"
            disabled={enCours}
            onClick={() => onCommander(a, true)}
          >
            <PowerIcon className="size-4" />
            {enCours ? "Envoi…" : "Allumer"}
          </Button>
        )}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onHistorique(a)}
            title="Historique des commandes"
          >
            <HistoryIcon className="size-4" />
          </Button>
          {!modeParcelle && (
            <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive"
                title="Supprimer"
              >
                <Trash2Icon className="size-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Supprimer « {a.nom} » ?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  L&apos;actionneur ne répondra plus aux commandes depuis la
                  plateforme. Cette action est réversible par l&apos;équipe
                  technique.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={() => onSupprimer(a)}>
                  Supprimer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
