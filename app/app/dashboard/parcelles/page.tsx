import Link from "next/link"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ParcellesTable } from "@/components/parcelles-table"

// Page Parcelles : app.agrismart.com/dashboard/parcelles
export default function ParcellesPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-semibold tracking-tight">Parcelles</h2>
          <p className="text-sm text-muted-foreground">
            Gérez vos parcelles agricoles et suivez leur état.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/parcelles/nouvelle">
            <Plus className="size-4" />
            Nouvelle parcelle
          </Link>
        </Button>
      </div>
      <ParcellesTable />
    </div>
  )
}
