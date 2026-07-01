"use client"

// Aperçu du tableau de bord client : quelques séries de valeurs réellement
// mesurées, pour des couples (parcelle, facteur) tirés au hasard à chaque
// consultation. Réutilise le graphe MesureChart de la page statistiques.

import { MesureChart } from "@/components/mesure-chart"
import type { ApercuCapteur } from "@/lib/stats/types"

export function ClientApercuCapteurs({
  apercu,
}: {
  apercu: ApercuCapteur[]
}) {
  if (apercu.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed p-8 text-sm text-muted-foreground">
        Aucune mesure disponible pour le moment. Les graphes apparaîtront dès que
        les capteurs commenceront à transmettre des données.
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {apercu.map((capteur) => (
        <MesureChart
          key={capteur.capteurId}
          serie={capteur}
          parcelleNom={capteur.parcelleNom}
          href={`/dashboard/capteurs/${capteur.capteurId}`}
        />
      ))}
    </div>
  )
}
