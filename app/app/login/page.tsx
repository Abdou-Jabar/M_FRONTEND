import { LoginForm } from "@/components/login-form"
import { FloatingThemeToggle } from "@/components/floating-theme-toggle"

// Page de connexion de l'espace utilisateurs : app.agrismart.com/login
// Rendu accueillant, avec connexion via réseau social et lien d'inscription.
export default function AppLoginPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-muted p-6 md:p-10">
      <FloatingThemeToggle />
      <div className="w-full max-w-sm">
        <LoginForm
          title="Bienvenue sur AgriSmart"
          description="Connectez-vous pour accéder à votre tableau de bord"
          submitLabel="Se connecter"
          espace="app"
          showSignUp
          signUpHref="/inscription"
          redirectTo="/dashboard"
        />
      </div>
    </div>
  )
}
