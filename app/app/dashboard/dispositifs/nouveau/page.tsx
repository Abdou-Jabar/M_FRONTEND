import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { DispositifForm } from "@/components/dispositif-form"

// Page de création d'un dispositif :
// app.agrismart.com/dashboard/dispositifs/nouveau
export default function NouveauDispositifPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex flex-col gap-2">
        <Button variant="ghost" size="sm" asChild className="-ml-2 w-fit">
          <Link href="/dashboard/dispositifs">
            <ArrowLeft className="size-4" />
            Retour aux dispositifs
          </Link>
        </Button>
        <h2 className="text-2xl font-semibold tracking-tight">
          Nouveau dispositif
        </h2>
        <p className="text-sm text-muted-foreground">
          Renseignez les informations du dispositif à enregistrer.
        </p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Informations du dispositif</CardTitle>
          <CardDescription>
            Le dispositif sera initialement hors ligne jusqu&apos;à sa première
            connexion.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DispositifForm />
        </CardContent>
      </Card>
    </div>
  )
}
