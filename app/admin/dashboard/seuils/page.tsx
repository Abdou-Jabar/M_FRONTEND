// Seuils de référence publiés par l'équipe AgriSmart (à implémenter).
export default function AdminSeuilsPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-semibold tracking-tight">
          Seuils de référence
        </h2>
        <p className="text-sm text-muted-foreground">
          Définissez les seuils de référence proposés aux organisations.
        </p>
      </div>
      <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed p-8 text-sm text-muted-foreground">
        La gestion des seuils de référence sera ajoutée ici prochainement.
      </div>
    </div>
  )
}
