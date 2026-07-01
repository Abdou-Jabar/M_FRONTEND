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
import { TechnicienForm } from "@/components/technicien-form"

export default function NouveauTechnicienPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex flex-col gap-2">
        <Button variant="ghost" size="sm" asChild className="-ml-2 w-fit">
          <Link href="/dashboard/techniciens">
            <ArrowLeft className="size-4" />
            Retour aux techniciens
          </Link>
        </Button>
        <h2 className="text-2xl font-semibold tracking-tight">
          Nouveau technicien
        </h2>
        <p className="text-sm text-muted-foreground">
          Créez un compte technicien de l&apos;équipe AgriSmart.
        </p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Informations du technicien</CardTitle>
          <CardDescription>
            Un mot de passe sera généré et envoyé par email.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TechnicienForm />
        </CardContent>
      </Card>
    </div>
  )
}
