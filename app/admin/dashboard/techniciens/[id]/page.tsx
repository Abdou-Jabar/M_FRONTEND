import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { TechnicienMissions } from "@/components/technicien-missions"

export default async function TechnicienDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2 w-fit">
        <Link href="/dashboard/techniciens">
          <ArrowLeft className="size-4" />
          Retour aux techniciens
        </Link>
      </Button>
      <TechnicienMissions technicienId={Number(id)} />
    </div>
  )
}
