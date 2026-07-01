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
import { ParcelleForm } from "@/components/parcelle-form"

// Page de création d'une parcelle :
// app.agrismart.com/dashboard/parcelles/nouvelle
export default function NouvelleParcellePage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex flex-col gap-2">
        <Button variant="ghost" size="sm" asChild className="-ml-2 w-fit">
          <Link href="/dashboard/parcelles">
            <ArrowLeft className="size-4" />
            Retour aux parcelles
          </Link>
        </Button>
        <h2 className="text-2xl font-semibold tracking-tight">
          Nouvelle parcelle
        </h2>
        <p className="text-sm text-muted-foreground">
          Renseignez les informations de la parcelle à enregistrer.
        </p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Informations de la parcelle</CardTitle>
          <CardDescription>
            Les champs marqués sont obligatoires.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ParcelleForm />
        </CardContent>
      </Card>
    </div>
  )
}
