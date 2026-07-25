import { CarteParcelles } from "@/components/carte-parcelles"

// Carte géographique — espace superviseur.
// Affiche TOUTES les parcelles de toutes les organisations.
// Le nom de l'organisation est affiché dans chaque popup.
export default function CarteSupervisionPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-semibold tracking-tight">
          Carte des parcelles
        </h2>
        <p className="text-sm text-muted-foreground">
          Vue globale de toutes les parcelles suivies par AgriSmart.
          Cliquez sur un marqueur pour voir les détails.
        </p>
        {/* Légende couleurs */}
        <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="inline-block size-3 rounded-full bg-[#22c55e]" />
            Aucune alerte
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block size-3 rounded-full bg-[#3b82f6]" />
            Information
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block size-3 rounded-full bg-[#eab308]" />
            Attention
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block size-3 rounded-full bg-[#f97316]" />
            Critique
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block size-3 rounded-full bg-[#ef4444]" />
            Urgence
          </span>
        </div>
      </div>

      <CarteParcelles
        lienDetailBase="/dashboard/parcelles"
        afficherOrganisation={true}
        lienCliquable={false}
        hauteur="calc(100vh - 220px)"
      />
    </div>
  )
}
