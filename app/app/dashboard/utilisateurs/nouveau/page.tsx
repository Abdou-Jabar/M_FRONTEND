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
import { UtilisateurForm } from "@/components/utilisateur-form"

// Création d'un utilisateur de l'organisation (espace client, ADMIN).
export default function NouvelUtilisateurPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex flex-col gap-2">
        <Button variant="ghost" size="sm" asChild className="-ml-2 w-fit">
          <Link href="/dashboard/utilisateurs">
            <ArrowLeft className="size-4" />
            Retour aux utilisateurs
          </Link>
        </Button>
        <h2 className="text-2xl font-semibold tracking-tight">
          Nouvel utilisateur
        </h2>
        <p className="text-sm text-muted-foreground">
          Créez un compte pour un membre de votre organisation.
        </p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Informations de l&apos;utilisateur</CardTitle>
          <CardDescription>
            Un mot de passe sera généré et envoyé par email.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UtilisateurForm />
        </CardContent>
      </Card>
    </div>
  )
}
