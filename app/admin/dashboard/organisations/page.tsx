import { OrganisationsTable } from "@/components/organisations-table"

// Gestion des organisations (espace équipe).
export default function AdminOrganisationsPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-semibold tracking-tight">Organisations</h2>
        <p className="text-sm text-muted-foreground">
          Validez, suspendez ou réactivez les organisations clientes.
        </p>
      </div>
      <OrganisationsTable />
    </div>
  )
}
