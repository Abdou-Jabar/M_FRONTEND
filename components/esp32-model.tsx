"use client"

// Enveloppe client qui charge la visionneuse 3D uniquement côté navigateur
// (ssr: false). WebGL n'existe pas au rendu serveur, on évite ainsi toute erreur.

import dynamic from "next/dynamic"

const Esp32Viewer = dynamic(() => import("./esp32-viewer"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
      Chargement du modèle 3D…
    </div>
  ),
})

export function Esp32Model() {
  return <Esp32Viewer />
}
