import Link from "next/link"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DispositifsTable } from "@/components/dispositifs-table"

// Page Dispositifs : app.agrismart.com/dashboard/dispositifs
export default function DispositifsPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-semibold tracking-tight">Dispositifs</h2>
          <p className="text-sm text-muted-foreground">
            Gérez vos dispositifs connectés et suivez leur état.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/dispositifs/nouveau">
            <Plus className="size-4" />
            Nouveau dispositif
          </Link>
        </Button>
      </div>
      <DispositifsTable />
    </div>
  )
}
