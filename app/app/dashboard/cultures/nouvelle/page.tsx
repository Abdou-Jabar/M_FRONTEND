import { Suspense } from "react"

import { CultureForm } from "@/components/culture-form"

// useSearchParams (présélection de parcelle) impose une frontière Suspense.
export default function NouvelleCulturePage() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-semibold tracking-tight">
          Nouvelle culture
        </h2>
        <p className="text-sm text-muted-foreground">
          Démarrez le suivi d&apos;une culture sur l&apos;une de vos parcelles.
        </p>
      </div>
      <Suspense>
        <CultureForm />
      </Suspense>
    </div>
  )
}
