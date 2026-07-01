import Link from "next/link"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { TechniciensTable } from "@/components/techniciens-table"

// Gestion des techniciens (espace superviseur).
export default function TechniciensPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-semibold tracking-tight">Techniciens</h2>
          <p className="text-sm text-muted-foreground">
            Gérez les techniciens et leurs affectations aux organisations.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/techniciens/nouveau">
            <Plus className="size-4" />
            Nouveau technicien
          </Link>
        </Button>
      </div>
      <TechniciensTable />
    </div>
  )
}
