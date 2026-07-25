import { RequireAdmin } from "@/components/require-admin"

// Section capteurs : réservée à l'ADMIN (pas visible pour l'agriculteur).
export default function CapteursLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <RequireAdmin>{children}</RequireAdmin>
}
