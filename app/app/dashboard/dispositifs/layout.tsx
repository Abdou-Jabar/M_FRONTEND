import { RequireAdmin } from "@/components/require-admin"

// Section dispositifs : réservée à l'ADMIN (pas visible pour l'agriculteur).
export default function DispositifsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <RequireAdmin>{children}</RequireAdmin>
}
