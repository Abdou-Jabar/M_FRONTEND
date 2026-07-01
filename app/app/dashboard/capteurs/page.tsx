import Link from "next/link"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { CapteursTable } from "@/components/capteurs-table"

// Page Capteurs : app.agrismart.com/dashboard/capteurs
export default function CapteursPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-semibold tracking-tight">Capteurs</h2>
          <p className="text-sm text-muted-foreground">
            Gérez les capteurs rattachés à vos dispositifs.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/capteurs/nouveau">
            <Plus className="size-4" />
            Nouveau capteur
          </Link>
        </Button>
      </div>
      <CapteursTable />
    </div>
  )
}
