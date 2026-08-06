"use client"

import { use } from "react"
import { TicketDetail } from "@/components/ticket-detail"

// Détail d'un ticket — vue équipe AgriSmart.
// TicketDetail gère l'action « Affecter » (technicien + priorité)
// réservée au superviseur.
export default function AdminTicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const ticketId = Number(id)

  if (Number.isNaN(ticketId)) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-sm text-muted-foreground">
        Identifiant de ticket invalide.
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <TicketDetail ticketId={ticketId} />
    </div>
  )
}
