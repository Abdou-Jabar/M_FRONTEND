import { ParcelleAgriculteur } from "@/components/parcelle-agriculteur"

// Détail d'une parcelle vue par l'agriculteur :
// culture active, alertes, graphes des mesures.
export default async function ParcelleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return <ParcelleAgriculteur id={Number(id)} />
}
