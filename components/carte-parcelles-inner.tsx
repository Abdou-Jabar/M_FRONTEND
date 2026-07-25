"use client"

// Composant interne Leaflet — chargé uniquement côté client via dynamic import.
// Ne pas importer directement : utiliser CarteParcelles à la place.

import { useEffect } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import {
  couleurMarqueur,
  type NiveauAlerteMax,
  type ParcelleCartePoint,
} from "@/lib/parcelles/carte"
import {
  ENVIRONNEMENT_LABELS,
  TYPE_SOL_LABELS,
} from "@/lib/parcelles/types"

// Leaflet utilise des icônes PNG chargées via URL — on les force manuellement
// car Next.js ne sert pas les assets de node_modules comme webpack classique.
function corrigerIconesLeaflet() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  })
}

// Crée une icône SVG colorée selon le niveau d'alerte.
function creerIcone(niveau: NiveauAlerteMax): L.DivIcon {
  const couleur = couleurMarqueur(niveau)
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="24" height="36">
      <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 24 12 24s12-15 12-24C24 5.373 18.627 0 12 0z"
            fill="${couleur}" stroke="white" stroke-width="1.5"/>
      <circle cx="12" cy="12" r="5" fill="white"/>
    </svg>`
  return L.divIcon({
    html: svg,
    className: "",
    iconSize: [24, 36],
    iconAnchor: [12, 36],
    popupAnchor: [0, -36],
  })
}

const NIVEAU_LABELS: Record<NiveauAlerteMax, string> = {
  AUCUNE:    "Aucune alerte",
  INFO:      "Information",
  ATTENTION: "Attention",
  CRITIQUE:  "Critique",
  URGENCE:   "Urgence",
}

const NIVEAU_BADGE_CLASS: Record<NiveauAlerteMax, string> = {
  AUCUNE:    "bg-emerald-100 text-emerald-800",
  INFO:      "bg-blue-100 text-blue-800",
  ATTENTION: "bg-yellow-100 text-yellow-800",
  CRITIQUE:  "bg-orange-100 text-orange-800",
  URGENCE:   "bg-red-100 text-red-800",
}

// Ajuste le centre/zoom de la carte selon les marqueurs présents.
function AjusteurBounds({ parcelles }: { parcelles: ParcelleCartePoint[] }) {
  const map = useMap()
  useEffect(() => {
    if (parcelles.length === 0) return
    if (parcelles.length === 1) {
      map.setView([parcelles[0].latitude, parcelles[0].longitude], 13)
      return
    }
    const bounds = L.latLngBounds(
      parcelles.map((p) => [p.latitude, p.longitude] as L.LatLngTuple),
    )
    map.fitBounds(bounds, { padding: [40, 40] })
  }, [map, parcelles])
  return null
}

export function CarteParcellesInner({
  parcelles,
  lienDetailBase,
  afficherOrganisation = false,
  lienCliquable = true,
}: {
  parcelles: ParcelleCartePoint[]
  lienDetailBase: string
  afficherOrganisation?: boolean
  // false pour le superviseur : il voit les infos mais ne peut pas naviguer
  // vers le tableau de bord client (accès réservé à l'ADMIN/AGRICULTEUR).
  lienCliquable?: boolean
}) {
  useEffect(() => {
    corrigerIconesLeaflet()
  }, [])

  // Centre par défaut : Togo (~8.6°N, 0.82°E)
  const centre: L.LatLngTuple =
    parcelles.length > 0
      ? [parcelles[0].latitude, parcelles[0].longitude]
      : [8.6, 0.82]

  return (
    <MapContainer
      center={centre}
      zoom={parcelles.length === 1 ? 13 : 7}
      style={{ height: "100%", width: "100%" }}
      className="rounded-xl"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <AjusteurBounds parcelles={parcelles} />

      {parcelles.map((p) => {
        const niveau = p.niveauAlerteMax as NiveauAlerteMax
        return (
          <Marker
            key={p.id}
            position={[p.latitude, p.longitude]}
            icon={creerIcone(niveau)}
          >
            <Popup minWidth={220} maxWidth={280}>
              <div className="flex flex-col gap-2 py-1">

                {/* Photo de la parcelle */}
                {p.photoUrl && (
                  <img
                    src={p.photoUrl}
                    alt={p.nom}
                    className="h-28 w-full rounded-md object-cover"
                  />
                )}

                {/* Nom + badge alerte */}
                <div className="flex items-start justify-between gap-2">
                  <span className="font-semibold text-sm leading-tight">
                    {p.nom}
                  </span>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${NIVEAU_BADGE_CLASS[niveau]}`}
                  >
                    {NIVEAU_LABELS[niveau]}
                  </span>
                </div>

                {/* Organisation (vue superviseur) */}
                {afficherOrganisation && p.organisationNom && (
                  <p className="text-xs text-gray-500">{p.organisationNom}</p>
                )}

                {/* Infos parcelle */}
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-gray-600">
                  <span className="font-medium">Environnement</span>
                  <span>{ENVIRONNEMENT_LABELS[p.environnement]}</span>
                  <span className="font-medium">Sol</span>
                  <span>{TYPE_SOL_LABELS[p.typeSol]}</span>
                  <span className="font-medium">Superficie</span>
                  <span>{p.superficie?.toLocaleString("fr-FR")} m²</span>
                  {p.alertesNonResolues > 0 && (
                    <>
                      <span className="font-medium">Alertes</span>
                      <span className="text-red-600 font-medium">
                        {p.alertesNonResolues} non résolue
                        {p.alertesNonResolues > 1 ? "s" : ""}
                      </span>
                    </>
                  )}
                </div>

                {/* Description */}
                {p.description && (
                  <p className="text-xs text-gray-500 italic">{p.description}</p>
                )}

                {/* Bouton voir — uniquement pour ADMIN/AGRICULTEUR */}
                {lienCliquable && (
                  <a
                    href={`${lienDetailBase}/${p.id}`}
                    className="mt-1 inline-flex items-center justify-center rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    Voir la parcelle →
                  </a>
                )}
              </div>
            </Popup>
          </Marker>
        )
      })}
    </MapContainer>
  )
}
