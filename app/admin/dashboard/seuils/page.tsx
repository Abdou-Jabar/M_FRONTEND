// Gestion du catalogue des types de culture et des seuils d'alerte
// (superviseur). Un seuil est configuré par type de culture, saison
// et type de sol de la parcelle.
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SeuilsManager } from "@/components/seuils-manager"
import { TypesCultureTable } from "@/components/types-culture-table"

export default function AdminSeuilsPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-semibold tracking-tight">
          Types de culture &amp; seuils
        </h2>
        <p className="text-sm text-muted-foreground">
          Gérez le catalogue des cultures et configurez les seuils d&apos;alerte
          par saison et type de sol.
        </p>
      </div>
      <Tabs defaultValue="seuils" className="flex flex-1 flex-col gap-4">
        <TabsList className="w-fit">
          <TabsTrigger value="seuils">Seuils</TabsTrigger>
          <TabsTrigger value="types">Types de culture</TabsTrigger>
        </TabsList>
        <TabsContent value="seuils">
          <SeuilsManager />
        </TabsContent>
        <TabsContent value="types">
          <TypesCultureTable />
        </TabsContent>
      </Tabs>
    </div>
  )
}
