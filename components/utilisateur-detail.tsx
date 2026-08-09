"use client"

// Vue détaillée d'un utilisateur : profil, parcelles affectées,
// tickets soumis, dernières actions (commandes d'actionneurs)
// et activation / désactivation du compte.

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  BrainCircuit,
  MapPin,
  Power,
  PowerOff,
  Ticket as TicketIcon,
  Zap,
} from "lucide-react"
import { toast } from "sonner"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import { ApiError } from "@/lib/api"
import {
  changerStatutUtilisateur,
  getUtilisateurDetail,
} from "@/lib/utilisateurs/utilisateur-service"
import {
  ROLE_LABELS,
  type UtilisateurDetail as UtilisateurDetailType,
} from "@/lib/utilisateurs/types"
import { STATUT_LABELS, type StatutTicket } from "@/lib/tickets/types"

function formatDate(iso: string | null | undefined) {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function formatDateHeure(iso: string | null | undefined) {
  if (!iso) return "—"
  return new Date(iso).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function libelleStatutTicket(statut: string) {
  return STATUT_LABELS[statut as StatutTicket] ?? statut
}

export function UtilisateurDetail({ id }: { id: number }) {
  const router = useRouter()

  const [detail, setDetail] = useState<UtilisateurDetailType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Confirmation avant changement de statut du compte.
  const [confirmerStatut, setConfirmerStatut] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const charger = useCallback(() => {
    setIsLoading(true)
    setError(null)
    getUtilisateurDetail(id)
      .then((data) => setDetail(data))
      .catch((e) => {
        setError(
          e instanceof ApiError
            ? e.message
            : "Impossible de charger le détail de l'utilisateur.",
        )
      })
      .finally(() => setIsLoading(false))
  }, [id])

  useEffect(() => {
    charger()
  }, [charger])

  async function confirmerChangementStatut() {
    if (!detail) return
    const nouveauStatut = !detail.utilisateur.actif
    setIsUpdating(true)
    try {
      const maj = await changerStatutUtilisateur(id, nouveauStatut)
      setDetail((prev) => (prev ? { ...prev, utilisateur: maj } : prev))
      toast.success(
        nouveauStatut
          ? "Le compte a été réactivé."
          : "Le compte a été désactivé.",
      )
      setConfirmerStatut(false)
    } catch (e) {
      toast.error(
        e instanceof ApiError
          ? e.message
          : "Impossible de modifier le statut du compte.",
      )
    } finally {
      setIsUpdating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-4 lg:p-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (error || !detail) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-8 text-sm text-muted-foreground m-4 lg:m-6">
        <p>{error ?? "Utilisateur introuvable."}</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            Retour
          </Button>
          <Button variant="outline" size="sm" onClick={charger}>
            Réessayer
          </Button>
        </div>
      </div>
    )
  }

  const u = detail.utilisateur
  const initiales = `${u.prenom?.[0] ?? ""}${u.nom?.[0] ?? ""}`.toUpperCase()

  return (
    <div className="flex flex-col gap-4 p-4 lg:p-6">
      {/* En-tête profil */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          onClick={() => router.back()}
          aria-label="Retour"
        >
          <ArrowLeft className="size-4" />
        </Button>
        <h1 className="text-lg font-semibold">Détail de l'utilisateur</h1>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="size-14">
              <AvatarImage src={u.photoUrl ?? undefined} alt="" />
              <AvatarFallback>{initiales || "?"}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-base font-semibold">
                  {u.prenom} {u.nom}
                </span>
                <Badge variant="secondary">{ROLE_LABELS[u.role]}</Badge>
                <Badge variant={u.actif ? "default" : "destructive"}>
                  {u.actif ? "Actif" : "Inactif"}
                </Badge>
                {!u.estVerifie && (
                  <Badge variant="outline">Non vérifié</Badge>
                )}
              </div>
              <span className="text-sm text-muted-foreground">{u.email}</span>
              <span className="text-xs text-muted-foreground">
                Membre depuis le {formatDate(u.dateCreation)}
                {u.organisationNom ? ` — ${u.organisationNom}` : ""}
              </span>
            </div>
          </div>

          <Button
            variant={u.actif ? "destructive" : "default"}
            onClick={() => setConfirmerStatut(true)}
          >
            {u.actif ? (
              <>
                <PowerOff className="size-4" />
                Désactiver le compte
              </>
            ) : (
              <>
                <Power className="size-4" />
                Réactiver le compte
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Compteurs */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription className="flex items-center gap-2">
              <MapPin className="size-4" />
              Parcelles affectées
            </CardDescription>
            <CardTitle className="text-2xl">
              {detail.parcelles.length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription className="flex items-center gap-2">
              <TicketIcon className="size-4" />
              Tickets soumis
            </CardDescription>
            <CardTitle className="text-2xl">{detail.nbTickets}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription className="flex items-center gap-2">
              <Zap className="size-4" />
              Actions menées
            </CardDescription>
            <CardTitle className="text-2xl">
              {detail.commandes.length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription className="flex items-center gap-2">
              <BrainCircuit className="size-4" />
              Diagnostics IA
            </CardDescription>
            <CardTitle className="text-2xl">{detail.nbDiagnostics}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Parcelles affectées */}
      <Card>
        <CardHeader>
          <CardTitle>Parcelles affectées</CardTitle>
          <CardDescription>
            Parcelles dont l'utilisateur a la charge.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {detail.parcelles.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aucune parcelle affectée.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Parcelle</TableHead>
                  <TableHead>Affectée le</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {detail.parcelles.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">
                      {p.parcelleNom}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(p.dateAffection)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Tickets soumis */}
      <Card>
        <CardHeader>
          <CardTitle>Tickets soumis</CardTitle>
          <CardDescription>
            Les {detail.tickets.length} derniers tickets créés par
            l'utilisateur (sur {detail.nbTickets}).
          </CardDescription>
        </CardHeader>
        <CardContent>
          {detail.tickets.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aucun ticket soumis.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titre</TableHead>
                  <TableHead>Parcelle</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Créé le</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {detail.tickets.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.titre}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {t.parcelleNom ?? "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {libelleStatutTicket(t.statut)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDateHeure(t.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dernières actions */}
      <Card>
        <CardHeader>
          <CardTitle>Dernières actions</CardTitle>
          <CardDescription>
            Commandes d'actionneurs envoyées par l'utilisateur.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {detail.commandes.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aucune action enregistrée.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Actionneur</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Commande</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {detail.commandes.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">
                      {c.actionneurNom}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {c.actionneurType ?? "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={c.etatDemande ? "default" : "outline"}>
                        {c.etatDemande ? "Activation" : "Arrêt"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDateHeure(c.dateCommande)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Confirmation activation / désactivation */}
      <AlertDialog open={confirmerStatut} onOpenChange={setConfirmerStatut}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {u.actif ? "Désactiver ce compte ?" : "Réactiver ce compte ?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {u.actif
                ? `${u.prenom} ${u.nom} ne pourra plus se connecter à la plateforme tant que son compte sera désactivé.`
                : `${u.prenom} ${u.nom} pourra de nouveau se connecter à la plateforme.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdating}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              disabled={isUpdating}
              onClick={(e) => {
                e.preventDefault()
                confirmerChangementStatut()
              }}
            >
              {isUpdating
                ? "En cours..."
                : u.actif
                  ? "Désactiver"
                  : "Réactiver"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
