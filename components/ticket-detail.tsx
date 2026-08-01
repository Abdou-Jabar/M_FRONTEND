"use client"

// Composant de détail complet d'un ticket.
// Gère toutes les transitions de statut selon le rôle de l'utilisateur connecté :
//   ADMIN       → Valider / Rejeter
//   SUPERVISEUR → Affecter (technicien + priorité)
//   TECHNICIEN  → Prendre en charge / Résoudre (rapport WYSIWYG)
//   AGRICULTEUR → Fermer (confirmer) / Contester (réouvrir)
// Inclut le fil de commentaires avec saisie.

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  ArrowLeftIcon,
  CalendarIcon,
  ImageIcon,
  MapPinIcon,
  MessageSquareIcon,
  RefreshCwIcon,
  SendIcon,
  UserIcon,
  XIcon,
} from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TicketStatutBadge } from "@/components/ticket-statut-badge"
import { TicketPrioriteBadge } from "@/components/ticket-priorite-badge"
import { RapportEditor } from "@/components/rapport-editor"
import { ApiError } from "@/lib/api"
import {
  affecterTicket,
  ajouterCommentaire,
  contesterTicket,
  fermerTicket,
  getCommentaires,
  getTicket,
  prendreEnChargeTicket,
  rejeterTicket,
  resoudreTicket,
  validerTicket,
} from "@/lib/tickets/ticket-service"
import { getUtilisateurs } from "@/lib/utilisateurs/utilisateur-service"
import type { Utilisateur } from "@/lib/utilisateurs/types"
import {
  PRIORITE_OPTIONS,
  type AffecterTicketRequest,
  type CommentaireTicketResponse,
  type PrioriteTicket,
  type TicketResponse,
} from "@/lib/tickets/types"
import { useAuth } from "@/lib/auth/use-auth"
import { cn } from "@/lib/utils"

function formaterDate(iso: string): string {
  return new Date(iso).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function formaterDateCourte(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

// ── Composant principal ────────────────────────────────────────────────────

export function TicketDetail({ ticketId }: { ticketId: number }) {
  const { user } = useAuth()

  const [ticket, setTicket] = useState<TicketResponse | null>(null)
  const [commentaires, setCommentaires] = useState<CommentaireTicketResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Photo en grand (lightbox simple)
  const [photoAgrandie, setPhotoAgrandie] = useState<string | null>(null)

  function charger() {
    let actif = true

    Promise.resolve().then(() => {
      if (!actif) return
      setIsLoading(true)
      setError(null)
      Promise.all([
        getTicket(ticketId),
        getCommentaires(ticketId, 0, 100),
      ])
        .then(([t, c]) => {
          if (!actif) return
          setTicket(t)
          setCommentaires(c.content)
        })
        .catch((e) => {
          if (!actif) return
          setError(e instanceof ApiError ? e.message : "Impossible de charger le ticket.")
        })
        .finally(() => { if (actif) setIsLoading(false) })
    })

    return () => { actif = false }
  }

  useEffect(() => {
    return charger()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketId])

  if (isLoading) return <TicketDetailSkeleton />

  if (error || !ticket) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-12 text-sm text-muted-foreground">
        <p>{error ?? "Ticket introuvable."}</p>
        <Button variant="outline" size="sm" onClick={charger}>
          <RefreshCwIcon className="size-4" />
          Réessayer
        </Button>
      </div>
    )
  }

  const role = user?.role
  const estCreateur = user?.utilisateurId === ticket.createurId
  const estTechnicienAssigne =
    role === "TECHNICIEN" && user?.utilisateurId === ticket.technicienId

  return (
    <div className="flex flex-col gap-6">

      {/* Navigation retour */}
      <Button variant="ghost" size="sm" className="w-fit" asChild>
        <Link href="/dashboard/tickets">
          <ArrowLeftIcon className="size-4" />
          Retour aux tickets
        </Link>
      </Button>

      {/* En-tête ticket */}
      <div className="flex flex-col gap-3 rounded-xl border p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">#{ticket.id}</span>
          <TicketStatutBadge statut={ticket.statut} />
          {ticket.priorite && <TicketPrioriteBadge priorite={ticket.priorite} />}
        </div>

        <h2 className="text-xl font-semibold leading-snug">{ticket.titre}</h2>

        {/* Méta */}
        <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <UserIcon className="size-3.5" />
            {ticket.createurPrenom} {ticket.createurNom}
            <Badge variant="outline" className="text-xs">{ticket.createurRole}</Badge>
          </span>
          {ticket.parcelleNom && (
            <span className="flex items-center gap-1.5">
              <MapPinIcon className="size-3.5" />
              {ticket.parcelleNom}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <CalendarIcon className="size-3.5" />
            {formaterDateCourte(ticket.createdAt)}
          </span>
        </div>

        {/* Description */}
        <Separator />
        <p className="whitespace-pre-wrap text-sm leading-relaxed">
          {ticket.description}
        </p>

        {/* Photos jointes */}
        {ticket.photos.length > 0 && (
          <>
            <Separator />
            <div className="flex flex-col gap-2">
              <p className="flex items-center gap-1.5 text-sm font-medium">
                <ImageIcon className="size-4" />
                Photos jointes ({ticket.photos.length})
              </p>
              <div className="flex flex-wrap gap-3">
                {ticket.photos.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPhotoAgrandie(p.url)}
                    className="size-24 shrink-0 overflow-hidden rounded-lg border transition-opacity hover:opacity-80"
                    aria-label="Agrandir la photo"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.url}
                      alt={p.nomFichierOriginal ?? "Photo"}
                      className="size-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Motif de rejet */}
        {ticket.statut === "REJETE" && ticket.motifRejet && (
          <>
            <Separator />
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
              <p className="text-sm font-medium text-destructive">Motif du rejet</p>
              <p className="mt-1 text-sm">{ticket.motifRejet}</p>
            </div>
          </>
        )}

        {/* Technicien assigné */}
        {ticket.technicienNom && (
          <>
            <Separator />
            <p className="text-sm text-muted-foreground">
              Technicien assigné :{" "}
              <span className="font-medium text-foreground">
                {ticket.technicienPrenom} {ticket.technicienNom}
              </span>
            </p>
          </>
        )}

        {/* Dates clés */}
        {(ticket.resolvedAt || ticket.closedAt) && (
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
            {ticket.resolvedAt && (
              <span>Résolu le {formaterDate(ticket.resolvedAt)}</span>
            )}
            {ticket.closedAt && (
              <span>Fermé le {formaterDate(ticket.closedAt)}</span>
            )}
          </div>
        )}
      </div>

      {/* Rapport d'intervention (lecture) */}
      {ticket.rapportIntervention && (
        <div className="flex flex-col gap-2 rounded-xl border p-5">
          <p className="font-semibold">Rapport d&apos;intervention</p>
          <div
            className="prose prose-sm dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: ticket.rapportIntervention }}
          />
        </div>
      )}

      {/* Zone d'actions selon le rôle et le statut */}
      <ZoneActions
        ticket={ticket}
        role={role}
        estCreateur={estCreateur}
        estTechnicienAssigne={estTechnicienAssigne}
        onTicketMisAJour={(t) => setTicket(t)}
      />

      {/* Fil de commentaires */}
      <FilCommentaires
        ticketId={ticketId}
        commentaires={commentaires}
        statut={ticket.statut}
        onCommentaireAjoute={(c) => setCommentaires((prev) => [...prev, c])}
      />

      {/* Lightbox photo */}
      {photoAgrandie && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setPhotoAgrandie(null)}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            className="absolute right-4 top-4 rounded-full bg-white/20 p-2 text-white"
            onClick={() => setPhotoAgrandie(null)}
            aria-label="Fermer"
          >
            <XIcon className="size-5" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photoAgrandie}
            alt="Aperçu aggrandi"
            className="max-h-[90vh] max-w-full rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}

// ── Zone d'actions (transitions de statut) ────────────────────────────────

interface ZoneActionsProps {
  ticket: TicketResponse
  role: string | undefined
  estCreateur: boolean
  estTechnicienAssigne: boolean
  onTicketMisAJour: (t: TicketResponse) => void
}

function ZoneActions({
  ticket,
  role,
  estCreateur,
  estTechnicienAssigne,
  onTicketMisAJour,
}: ZoneActionsProps) {
  const [busy, setBusy] = useState(false)

  // ── Dialogues ────────────────────────────────────────────────────────────
  const [dialogOuvert, setDialogOuvert] = useState<
    "rejeter" | "affecter" | "resoudre" | "contester" | null
  >(null)

  // Champs de formulaires inline
  const [motifRejet, setMotifRejet] = useState("")
  const [motifContestation, setMotifContestation] = useState("")
  const [rapport, setRapport] = useState("")
  const [technicienId, setTechnicienId] = useState<string>("")
  const [priorite, setPriorite] = useState<PrioriteTicket | "">("")
  const [techniciens, setTechniciens] = useState<Utilisateur[]>([])
  const [chargementTech, setChargementTech] = useState(false)

  // Charge la liste des techniciens à l'ouverture du dialogue d'affectation.
  useEffect(() => {
    if (dialogOuvert !== "affecter") return
    let actif = true
    Promise.resolve().then(() => {
      if (!actif) return
      setChargementTech(true)
      getUtilisateurs()
        .then((liste) => {
          if (!actif) return
          setTechniciens(liste.filter((u) => u.role === "TECHNICIEN" && u.actif))
        })
        .catch(() => { /* non bloquant */ })
        .finally(() => { if (actif) setChargementTech(false) })
    })
    return () => { actif = false }
  }, [dialogOuvert])

  async function executer(action: () => Promise<TicketResponse>) {
    setBusy(true)
    try {
      const updated = await action()
      onTicketMisAJour(updated)
      setDialogOuvert(null)
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Action impossible.")
    } finally {
      setBusy(false)
    }
  }

  // ── Rendu conditionnel des boutons ────────────────────────────────────────

  // Admin : valider / rejeter (statut SOUMIS ou REOUVERT)
  const peutValiderRejeter =
    role === "ADMIN" &&
    (ticket.statut === "SOUMIS" || ticket.statut === "REOUVERT")

  // Superviseur : affecter (statut VALIDE)
  const peutAffecter = role === "SUPERVISEUR" && ticket.statut === "VALIDE"

  // Technicien : prendre en charge (statut AFFECTE + assigné)
  const peutPrendreEnCharge =
    estTechnicienAssigne && ticket.statut === "AFFECTE"

  // Technicien : résoudre (statut EN_COURS + assigné)
  const peutResoudre = estTechnicienAssigne && ticket.statut === "EN_COURS"

  // Créateur (agriculteur ou admin) : fermer / contester (statut RESOLU)
  const peutFermerContester = estCreateur && ticket.statut === "RESOLU"

  const aucuneAction =
    !peutValiderRejeter &&
    !peutAffecter &&
    !peutPrendreEnCharge &&
    !peutResoudre &&
    !peutFermerContester

  if (aucuneAction) return null

  return (
    <div className="flex flex-col gap-3 rounded-xl border p-5">
      <p className="font-semibold">Actions</p>

      <div className="flex flex-wrap gap-2">

        {/* ── ADMIN : valider ── */}
        {peutValiderRejeter && (
          <Button
            variant="default"
            size="sm"
            disabled={busy}
            onClick={() =>
              executer(() => {
                toast.success("Ticket validé.")
                return validerTicket(ticket.id)
              })
            }
          >
            Valider le ticket
          </Button>
        )}

        {/* ── ADMIN : rejeter ── */}
        {peutValiderRejeter && (
          <Button
            variant="destructive"
            size="sm"
            disabled={busy}
            onClick={() => { setMotifRejet(""); setDialogOuvert("rejeter") }}
          >
            Rejeter
          </Button>
        )}

        {/* ── SUPERVISEUR : affecter ── */}
        {peutAffecter && (
          <Button
            variant="default"
            size="sm"
            disabled={busy}
            onClick={() => {
              setTechnicienId("")
              setPriorite("")
              setDialogOuvert("affecter")
            }}
          >
            Affecter un technicien
          </Button>
        )}

        {/* ── TECHNICIEN : prendre en charge ── */}
        {peutPrendreEnCharge && (
          <Button
            variant="default"
            size="sm"
            disabled={busy}
            onClick={() =>
              executer(async () => {
                const t = await prendreEnChargeTicket(ticket.id)
                toast.success("Ticket pris en charge.")
                return t
              })
            }
          >
            {busy ? "En cours…" : "Prendre en charge"}
          </Button>
        )}

        {/* ── TECHNICIEN : résoudre ── */}
        {peutResoudre && (
          <Button
            variant="default"
            size="sm"
            disabled={busy}
            onClick={() => { setRapport(""); setDialogOuvert("resoudre") }}
          >
            Soumettre le rapport
          </Button>
        )}

        {/* ── CREATEUR : fermer ── */}
        {peutFermerContester && (
          <Button
            variant="default"
            size="sm"
            disabled={busy}
            onClick={() =>
              executer(async () => {
                const t = await fermerTicket(ticket.id)
                toast.success("Ticket fermé. Merci !")
                return t
              })
            }
          >
            {busy ? "Fermeture…" : "Confirmer la résolution"}
          </Button>
        )}

        {/* ── CREATEUR : contester ── */}
        {peutFermerContester && (
          <Button
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={() => { setMotifContestation(""); setDialogOuvert("contester") }}
          >
            Contester
          </Button>
        )}
      </div>

      {/* ── Dialogue : rejeter ── */}
      <AlertDialog
        open={dialogOuvert === "rejeter"}
        onOpenChange={(o) => { if (!o && !busy) setDialogOuvert(null) }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rejeter ce ticket ?</AlertDialogTitle>
            <AlertDialogDescription>
              Le créateur sera notifié avec le motif que vous saisissez.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            placeholder="Motif du rejet (obligatoire)"
            value={motifRejet}
            onChange={(e) => setMotifRejet(e.target.value)}
            disabled={busy}
            className="mt-2"
          />
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              disabled={busy || motifRejet.trim() === ""}
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={(e) => {
                e.preventDefault()
                executer(async () => {
                  const t = await rejeterTicket(ticket.id, { motifRejet: motifRejet.trim() })
                  toast.success("Ticket rejeté.")
                  return t
                })
              }}
            >
              {busy ? "Rejet…" : "Rejeter"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Dialogue : affecter ── */}
      <AlertDialog
        open={dialogOuvert === "affecter"}
        onOpenChange={(o) => { if (!o && !busy) setDialogOuvert(null) }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Affecter un technicien</AlertDialogTitle>
            <AlertDialogDescription>
              Choisissez le technicien et la priorité de ce ticket.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="flex flex-col gap-3 py-2">
            <Select
              value={technicienId}
              onValueChange={setTechnicienId}
              disabled={busy || chargementTech}
            >
              <SelectTrigger>
                <SelectValue placeholder={chargementTech ? "Chargement…" : "Technicien"} />
              </SelectTrigger>
              <SelectContent>
                {techniciens.map((t) => (
                  <SelectItem key={t.id} value={String(t.id)}>
                    {t.prenom} {t.nom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={priorite}
              onValueChange={(v) => setPriorite(v as PrioriteTicket)}
              disabled={busy}
            >
              <SelectTrigger>
                <SelectValue placeholder="Priorité" />
              </SelectTrigger>
              <SelectContent>
                {PRIORITE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              disabled={busy || !technicienId || !priorite}
              onClick={(e) => {
                e.preventDefault()
                const payload: AffecterTicketRequest = {
                  technicienId: Number(technicienId),
                  priorite: priorite as PrioriteTicket,
                }
                executer(async () => {
                  const t = await affecterTicket(ticket.id, payload)
                  toast.success("Ticket affecté.")
                  return t
                })
              }}
            >
              {busy ? "Affectation…" : "Affecter"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Dialogue : résoudre (rapport WYSIWYG) ── */}
      <AlertDialog
        open={dialogOuvert === "resoudre"}
        onOpenChange={(o) => { if (!o && !busy) setDialogOuvert(null) }}
      >
        <AlertDialogContent className="sm:max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Rapport d&apos;intervention</AlertDialogTitle>
            <AlertDialogDescription>
              Décrivez ce qui a été fait. Ce rapport sera visible par le créateur du ticket.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <RapportEditor
            value={rapport}
            onChange={setRapport}
            disabled={busy}
          />
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              disabled={busy || rapport.trim() === "" || rapport === "<p></p>"}
              onClick={(e) => {
                e.preventDefault()
                executer(async () => {
                  const t = await resoudreTicket(ticket.id, { rapportIntervention: rapport })
                  toast.success("Ticket marqué comme résolu.")
                  return t
                })
              }}
            >
              {busy ? "Envoi…" : "Soumettre le rapport"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Dialogue : contester ── */}
      <AlertDialog
        open={dialogOuvert === "contester"}
        onOpenChange={(o) => { if (!o && !busy) setDialogOuvert(null) }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Contester la résolution ?</AlertDialogTitle>
            <AlertDialogDescription>
              Expliquez pourquoi le problème n&apos;est pas résolu. Le ticket sera réouvert.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            placeholder="Motif de contestation (obligatoire)"
            value={motifContestation}
            onChange={(e) => setMotifContestation(e.target.value)}
            disabled={busy}
            className="mt-2"
          />
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              disabled={busy || motifContestation.trim() === ""}
              onClick={(e) => {
                e.preventDefault()
                executer(async () => {
                  const t = await contesterTicket(ticket.id, { motif: motifContestation.trim() })
                  toast.success("Ticket réouvert.")
                  return t
                })
              }}
            >
              {busy ? "Réouverture…" : "Contester"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// ── Fil de commentaires ───────────────────────────────────────────────────

interface FilCommentairesProps {
  ticketId: number
  commentaires: CommentaireTicketResponse[]
  statut: TicketResponse["statut"]
  onCommentaireAjoute: (c: CommentaireTicketResponse) => void
}

function FilCommentaires({
  ticketId,
  commentaires,
  statut,
  onCommentaireAjoute,
}: FilCommentairesProps) {
  const { user } = useAuth()
  const [contenu, setContenu] = useState("")
  const [envoi, setEnvoi] = useState(false)

  const peutCommenter = statut !== "FERME" && statut !== "REJETE"

  async function handleEnvoyer(e: React.FormEvent) {
    e.preventDefault()
    if (!contenu.trim() || envoi) return
    setEnvoi(true)
    try {
      const c = await ajouterCommentaire(ticketId, { contenu: contenu.trim() })
      onCommentaireAjoute(c)
      setContenu("")
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Envoi impossible.")
    } finally {
      setEnvoi(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border p-5">
      <p className="flex items-center gap-2 font-semibold">
        <MessageSquareIcon className="size-4" />
        Commentaires
        {commentaires.length > 0 && (
          <Badge variant="secondary">{commentaires.length}</Badge>
        )}
      </p>

      {commentaires.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Aucun commentaire pour le moment.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {commentaires.map((c) => {
            const estMoi = user?.utilisateurId === c.auteurId
            return (
              <div
                key={c.id}
                className={cn(
                  "flex flex-col gap-1 rounded-lg border px-4 py-3",
                  estMoi && "border-primary/20 bg-primary/5",
                )}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium">
                    {c.auteurPrenom} {c.auteurNom}
                  </span>
                  <Badge variant="outline" className="text-xs">{c.auteurRole}</Badge>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {formaterDate(c.createdAt)}
                  </span>
                </div>
                <p className="whitespace-pre-wrap text-sm">{c.contenu}</p>
              </div>
            )
          })}
        </div>
      )}

      {peutCommenter && (
        <form onSubmit={handleEnvoyer} className="flex items-center gap-2">
          <Input
            placeholder="Ajouter un commentaire…"
            value={contenu}
            onChange={(e) => setContenu(e.target.value)}
            disabled={envoi}
            className="flex-1"
          />
          <Button
            type="submit"
            size="icon"
            disabled={envoi || contenu.trim() === ""}
            aria-label="Envoyer"
          >
            <SendIcon className="size-4" />
          </Button>
        </form>
      )}

      {!peutCommenter && (
        <p className="text-xs text-muted-foreground">
          Ce ticket est {statut === "FERME" ? "fermé" : "rejeté"} — les commentaires sont désactivés.
        </p>
      )}
    </div>
  )
}

// ── Skeleton de chargement ────────────────────────────────────────────────

function TicketDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-8 w-32" />
      <div className="flex flex-col gap-4 rounded-xl border p-5">
        <div className="flex gap-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-16" />
        </div>
        <Skeleton className="h-7 w-2/3" />
        <div className="flex gap-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-px w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
      <div className="flex flex-col gap-3 rounded-xl border p-5">
        <Skeleton className="h-5 w-24" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>
    </div>
  )
}
