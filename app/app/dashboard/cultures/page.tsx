import { MesCultures } from "@/components/mes-cultures"

export default function CulturesPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-semibold tracking-tight">Mes cultures</h2>
        <p className="text-sm text-muted-foreground">
          Suivez l&apos;état de vos cultures en cours et consultez leur
          historique.
        </p>
      </div>
      <MesCultures />
    </div>
  )
}
