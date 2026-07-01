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
import { CapteurForm } from "@/components/capteur-form"

// Page de création d'un capteur :
// app.agrismart.com/dashboard/capteurs/nouveau
export default function NouveauCapteurPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex flex-col gap-2">
        <Button variant="ghost" size="sm" asChild className="-ml-2 w-fit">
          <Link href="/dashboard/capteurs">
            <ArrowLeft className="size-4" />
            Retour aux capteurs
          </Link>
        </Button>
        <h2 className="text-2xl font-semibold tracking-tight">
          Nouveau capteur
        </h2>
        <p className="text-sm text-muted-foreground">
          Renseignez les informations du capteur à enregistrer.
        </p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Informations du capteur</CardTitle>
          <CardDescription>
            Le capteur sera rattaché à un dispositif existant.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CapteurForm />
        </CardContent>
      </Card>
    </div>
  )
}
