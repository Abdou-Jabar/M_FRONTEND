import { TicketForm } from "@/components/ticket-form"

export default function NouveauTicketPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-semibold tracking-tight">
          Ouvrir un ticket
        </h2>
        <p className="text-sm text-muted-foreground">
          Signalez un problème à l&apos;équipe de support AgriSmart.
        </p>
      </div>
      <TicketForm />
    </div>
  )
}
