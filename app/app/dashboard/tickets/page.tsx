import { TicketsListe } from "@/components/tickets-liste"

export default function TicketsPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-semibold tracking-tight">Tickets de support</h2>
        <p className="text-sm text-muted-foreground">
          Signalez un problème ou suivez l&apos;avancement de vos tickets en cours.
        </p>
      </div>
      <TicketsListe />
    </div>
  )
}
