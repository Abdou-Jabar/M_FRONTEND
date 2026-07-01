import { LoginForm } from "@/components/login-form"
import { FloatingThemeToggle } from "@/components/floating-theme-toggle"

// Page de connexion de l'espace administrateur : admin.agrismart.com/login
// Rendu sobre et sécurisé : pas de connexion via réseau social,
// pas de lien d'inscription (les comptes admin sont créés en interne).
export default function AdminLoginPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-background p-6 md:p-10">
      <FloatingThemeToggle />
      <div className="w-full max-w-sm rounded-xl border bg-card p-8 shadow-sm">
        <LoginForm
          title="Espace administrateur"
          description="Accès réservé au personnel autorisé d'AgriSmart"
          submitLabel="Accéder à l'administration"
          espace="admin"
          showSignUp={false}
          redirectTo="/dashboard"
        />
      </div>
    </div>
  )
}
