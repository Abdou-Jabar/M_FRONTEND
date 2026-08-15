import { apiFetch } from "@/lib/api"
import type { AnalyseSad } from "./types"

// GET /api/sad/analyse?parcelleIds=1&parcelleIds=2&jours=30
// L'appel peut prendre plusieurs secondes (rédaction du rapport par l'IA).
export function analyserParcelles(
  parcelleIds: number[],
  jours: number,
): Promise<AnalyseSad> {
  const params = new URLSearchParams()
  parcelleIds.forEach((id) => params.append("parcelleIds", String(id)))
  params.set("jours", String(jours))
  return apiFetch<AnalyseSad>(`/sad/analyse?${params.toString()}`)
}
