// Carte résumé d'un ticket utilisée dans la liste.
// Affiche : titre, statut, priorité, créateur, date, nombre de commentaires.

import Link from "next/link"
import {
  CalendarIcon,
  MessageSquareIcon,
  MapPinIcon,
  UserIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { TicketStatutBadge } from "@/components/ticket-statut-badge"
import { TicketPrioriteBadge } from "@/components/ticket-priorite-badge"
import type { TicketResponse } from "@/lib/tickets/types"

function formaterDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

interface TicketCardProps {
  ticket: TicketResponse
  href: string
  className?: string
}

export function TicketCard({ ticket, href, className }: TicketCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col gap-3 rounded-xl border p-4 transition-colors hover:bg-muted/50",
        className,
      )}
    >
      {/* Ligne 1 : badges statut + priorité */}
      <div className="flex flex-wrap items-center gap-2">
        <TicketStatutBadge statut={ticket.statut} />
        {ticket.priorite && (
          <TicketPrioriteBadge priorite={ticket.priorite} />
        )}
        <span className="ml-auto text-xs tabular-nums text-muted-foreground">
          #{ticket.id}
        </span>
      </div>

      {/* Ligne 2 : titre */}
      <p className="font-medium leading-snug">{ticket.titre}</p>

      {/* Ligne 3 : description tronquée */}
      <p className="line-clamp-2 text-sm text-muted-foreground">
        {ticket.description}
      </p>

      {/* Ligne 4 : méta-données */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <UserIcon className="size-3.5" />
          {ticket.createurPrenom} {ticket.createurNom}
        </span>

        {ticket.parcelleNom && (
          <span className="flex items-center gap-1">
            <MapPinIcon className="size-3.5" />
            {ticket.parcelleNom}
          </span>
        )}

        <span className="flex items-center gap-1">
          <CalendarIcon className="size-3.5" />
          {formaterDate(ticket.createdAt)}
        </span>

        {ticket.nombreCommentaires > 0 && (
          <span className="flex items-center gap-1">
            <MessageSquareIcon className="size-3.5" />
            {ticket.nombreCommentaires}
          </span>
        )}
      </div>

      {/* Technicien assigné (si applicable) */}
      {ticket.technicienNom && (
        <p className="text-xs text-muted-foreground">
          Technicien :{" "}
          <span className="font-medium text-foreground">
            {ticket.technicienPrenom} {ticket.technicienNom}
          </span>
        </p>
      )}
    </Link>
  )
}
