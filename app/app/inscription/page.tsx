import { OrganisationInscriptionForm } from "@/components/organisation-inscription-form"
import { FloatingThemeToggle } from "@/components/floating-theme-toggle"

// Inscription publique d'une organisation : app.agrismart.com/inscription
export default function InscriptionPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-muted p-6 md:p-10">
      <FloatingThemeToggle />
      <div className="w-full max-w-lg">
        <div className="mb-6 flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Inscrire votre organisation</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Créez l&apos;espace de votre organisation sur AgriSmart. Votre compte
            administrateur sera créé automatiquement.
          </p>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm md:p-8">
          <OrganisationInscriptionForm />
        </div>
      </div>
    </div>
  )
}
