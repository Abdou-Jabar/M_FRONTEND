import { MesMissions } from "@/components/mes-missions"

// Page self-service du technicien : ses missions en cours.
export default function MesMissionsPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-semibold tracking-tight">Mes missions</h2>
        <p className="text-sm text-muted-foreground">
          Organisations sur lesquelles vous intervenez. Marquez une mission
          comme terminée une fois votre intervention achevée.
        </p>
      </div>
      <MesMissions />
    </div>
  )
}
