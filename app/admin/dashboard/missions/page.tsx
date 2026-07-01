import { SupervisionMissions } from "@/components/supervision-missions"

// Vue superviseur : suivi (lecture seule) de toutes les missions des techniciens.
export default function MissionsSupervisionPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-semibold tracking-tight">Missions</h2>
        <p className="text-sm text-muted-foreground">
          Suivi de l&apos;avancement des missions de tous les techniciens.
        </p>
      </div>
      <SupervisionMissions />
    </div>
  )
}
