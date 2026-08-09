import { RequireAdmin } from "@/components/require-admin"

// Création de parcelle : réservée à l'ADMIN (le backend refuse
// l'écriture aux autres rôles via @PreAuthorize).
export default function NouvelleParcelleLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <RequireAdmin>{children}</RequireAdmin>
}
