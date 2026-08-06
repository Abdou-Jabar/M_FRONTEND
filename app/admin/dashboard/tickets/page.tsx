import { TicketsListe } from "@/components/tickets-liste"

// Tickets de support — vue équipe AgriSmart (superviseur).
// Le superviseur voit tous les tickets du système et affecte
// les tickets validés aux techniciens depuis la page de détail.
export default function AdminTicketsPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-semibold tracking-tight">
          Tickets de support
        </h2>
        <p className="text-sm text-muted-foreground">
          Suivez les tickets des organisations et affectez les tickets
          validés aux techniciens.
        </p>
      </div>
      <TicketsListe />
    </div>
  )
}
