import { UtilisateursTable } from "@/components/utilisateurs-table"

// Espace équipe : vue de l'ensemble des utilisateurs (toutes organisations).
export default function AdminUtilisateursPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-semibold tracking-tight">Utilisateurs</h2>
        <p className="text-sm text-muted-foreground">
          L&apos;ensemble des utilisateurs de la plateforme.
        </p>
      </div>
      <UtilisateursTable />
    </div>
  )
}
