import { UtilisateurDetail } from "@/components/utilisateur-detail"

// Détail d'un utilisateur : profil, parcelles affectées,
// tickets soumis, dernières actions et statut du compte.
export default async function UtilisateurDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return <UtilisateurDetail id={Number(id)} />
}
