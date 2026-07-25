import { MesAlertes } from "@/components/mes-alertes"

export default function AlertesPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-semibold tracking-tight">Mes alertes</h2>
        <p className="text-sm text-muted-foreground">
          Suivez les anomalies détectées sur vos parcelles et marquez-les comme
          résolues une fois traitées.
        </p>
      </div>
      <MesAlertes />
    </div>
  )
}
