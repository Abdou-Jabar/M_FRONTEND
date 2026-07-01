import { ModeToggle } from "@/components/mode-toggle"

// Sélecteur de thème fixé en haut à droite, pour les pages sans en-tête
// (pages de connexion, pages d'accueil des espaces).
export function FloatingThemeToggle() {
  return (
    <div className="fixed right-4 top-4 z-50">
      <ModeToggle />
    </div>
  )
}
