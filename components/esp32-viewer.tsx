"use client"

// Visionneuse 3D du dispositif AS-01 (modèle ESP32-WROOM au format .glb).
// Rendu via react-three-fiber + drei : rotation automatique, orbite à la souris.

import { Suspense } from "react"
import { Canvas } from "@react-three/fiber"
import { Bounds, Center, Html, OrbitControls, useGLTF } from "@react-three/drei"

const MODEL_URL = "/ESP32Wroom-mr.glb"

function Model() {
  const { scene } = useGLTF(MODEL_URL)
  return <primitive object={scene} />
}

// Préchargement du modèle dès que le module est évalué côté client.
useGLTF.preload(MODEL_URL)

function Loader() {
  return (
    <Html center>
      <span className="text-sm text-muted-foreground">Chargement du modèle 3D…</span>
    </Html>
  )
}

export default function Esp32Viewer() {
  return (
    <Canvas
      className="absolute inset-0 h-full w-full"
      camera={{ position: [0, 0, 6], fov: 45 }}
      dpr={[1, 2]}
      gl={{ antialias: true }}
      resize={{ scroll: false }}
    >
      {/* Éclairage simple (pas d'HDRI distant, fonctionne hors-ligne) */}
      <ambientLight intensity={0.9} />
      <directionalLight position={[5, 6, 5]} intensity={1.4} />
      <directionalLight position={[-5, -3, -5]} intensity={0.5} />

      <Suspense fallback={<Loader />}>
        <Bounds fit clip margin={1.25}>
          <Center>
            <Model />
          </Center>
        </Bounds>
      </Suspense>

      <OrbitControls
        makeDefault
        enablePan={false}
        autoRotate
        autoRotateSpeed={1.1}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={(5 * Math.PI) / 6}
      />
    </Canvas>
  )
}
