import { AuditJournal } from "@/components/audit-journal"

// Journal d'audit (espace équipe, superviseur uniquement) :
// traces des actions sensibles regroupées par organisation.
// L'accès est contrôlé côté backend (endpoint réservé au SUPERVISEUR)
// et le lien n'apparaît dans la sidebar que pour ce rôle.
export default function AdminAuditPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-semibold tracking-tight">
          Journal d&apos;audit
        </h2>
        <p className="text-sm text-muted-foreground">
          Traces des actions sensibles (commandes, tickets, comptes,
          seuils), regroupées par organisation.
        </p>
      </div>
      <AuditJournal />
    </div>
  )
}
