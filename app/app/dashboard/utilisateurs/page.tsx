import Link from "next/link"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { UtilisateursTable } from "@/components/utilisateurs-table"

// Page Utilisateurs (espace client) : gestion des comptes de l'organisation.
export default function UtilisateursPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-semibold tracking-tight">Utilisateurs</h2>
          <p className="text-sm text-muted-foreground">
            Gérez les comptes de votre organisation.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/utilisateurs/nouveau">
            <Plus className="size-4" />
            Nouvel utilisateur
          </Link>
        </Button>
      </div>
      <UtilisateursTable />
    </div>
  )
}
