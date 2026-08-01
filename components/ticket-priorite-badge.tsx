// Badge de priorité d'un ticket.

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  PRIORITE_LABELS,
  PRIORITE_VARIANT,
  type PrioriteTicket,
} from "@/lib/tickets/types"

export function TicketPrioriteBadge({
  priorite,
  className,
}: {
  priorite: PrioriteTicket
  className?: string
}) {
  return (
    <Badge variant={PRIORITE_VARIANT[priorite]} className={cn(className)}>
      {PRIORITE_LABELS[priorite]}
    </Badge>
  )
}
