import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ParcelleStatistiques } from "@/components/parcelle-statistiques"

// Statistiques d'une parcelle :
// app.agrismart.com/dashboard/parcelles/{id}
export default async function ParcelleStatistiquesPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2 w-fit">
        <Link href="/dashboard/parcelles">
          <ArrowLeft className="size-4" />
          Retour aux parcelles
        </Link>
      </Button>

      <ParcelleStatistiques id={Number(id)} />
    </div>
  )
}
