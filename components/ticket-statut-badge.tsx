// Badge de statut d'un ticket — couleur + point indicateur.

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  STATUT_DOT,
  STATUT_LABELS,
  STATUT_VARIANT,
  type StatutTicket,
} from "@/lib/tickets/types"

export function TicketStatutBadge({
  statut,
  className,
}: {
  statut: StatutTicket
  className?: string
}) {
  return (
    <Badge
      variant={STATUT_VARIANT[statut]}
      className={cn("gap-1.5", className)}
    >
      <span
        className={cn("size-1.5 shrink-0 rounded-full", STATUT_DOT[statut])}
        aria-hidden="true"
      />
      {STATUT_LABELS[statut]}
    </Badge>
  )
}
