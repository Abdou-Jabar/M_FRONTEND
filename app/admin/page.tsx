import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FloatingThemeToggle } from "@/components/floating-theme-toggle"

// Tableau de bord de l'espace administrateur : admin.agrismart.com
export default function AdminHomePage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-10">
      <FloatingThemeToggle />
      <h1 className="text-3xl font-semibold tracking-tight">
        Console d&apos;administration AgriSmart
      </h1>
      <p className="max-w-md text-center text-muted-foreground">
        Gérez les utilisateurs, les contenus et la configuration de la
        plateforme.
      </p>
      <Button asChild variant="outline">
        <Link href="/login">Se connecter</Link>
      </Button>
    </div>
  )
}
