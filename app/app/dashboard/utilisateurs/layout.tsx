import { RequireAdmin } from "@/components/require-admin"

// Section utilisateurs : réservée à l'ADMIN (gestion des comptes de l'org).
export default function UtilisateursLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <RequireAdmin>{children}</RequireAdmin>
}
