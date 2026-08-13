import { MotDePasseOublieForm } from "@/components/mot-de-passe-oublie-form"
import { FloatingThemeToggle } from "@/components/floating-theme-toggle"

// Réinitialisation du mot de passe — espace clients (app.*/mot-de-passe-oublie).
export default function AppMotDePasseOubliePage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-muted p-6 md:p-10">
      <FloatingThemeToggle />
      <div className="w-full max-w-sm">
        <MotDePasseOublieForm loginHref="/login" />
      </div>
    </div>
  )
}
