import { ChangePasswordForm } from "@/components/change-password-form"
import { FloatingThemeToggle } from "@/components/floating-theme-toggle"

// Changement de mot de passe obligatoire (espace client).
export default function AppChangerMotDePassePage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-muted p-6 md:p-10">
      <FloatingThemeToggle />
      <div className="w-full max-w-sm">
        <ChangePasswordForm />
      </div>
    </div>
  )
}
