import { AccountSettings } from "@/components/account-settings"

// Paramètres de compte (espace client).
export default function ParametresPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-semibold tracking-tight">
          Paramètres du compte
        </h2>
        <p className="text-sm text-muted-foreground">
          Gérez votre photo, vos informations et votre mot de passe.
        </p>
      </div>
      <AccountSettings />
    </div>
  )
}
