import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FloatingThemeToggle } from "@/components/floating-theme-toggle"

// Tableau de bord de l'espace utilisateurs : app.agrismart.com
export default function AppHomePage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-10">
      <FloatingThemeToggle />
      <h1 className="text-3xl font-semibold tracking-tight">
        Espace utilisateurs AgriSmart
      </h1>
      <p className="max-w-md text-center text-muted-foreground">
        Bienvenue dans votre tableau de bord. Suivez vos cultures et vos données
        en temps réel.
      </p>
      <Button asChild>
        <Link href="/login">Se connecter</Link>
      </Button>
    </div>
  )
}
