"use client"

// Liste des techniciens (équipe AgriSmart). Le nom renvoie vers la page de
// gestion des missions (affectations aux organisations).

import { useEffect, useState } from "react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ApiError } from "@/lib/api"
import { getUtilisateurs } from "@/lib/utilisateurs/utilisateur-service"
import type { Utilisateur } from "@/lib/utilisateurs/types"
import { useRecherchePagination } from "@/hooks/use-recherche-pagination"
import { BarreRecherche, PaginationTable } from "@/components/table-outils"

export function TechniciensTable() {
  const [techniciens, setTechniciens] = useState<Utilisateur[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const rp = useRecherchePagination(
    techniciens,
    (t) => `${t.prenom} ${t.nom} ${t.email}`,
  )

  useEffect(() => {
    let actif = true
    getUtilisateurs()
      .then((data) => {
        if (!actif) return
        setTechniciens(data.filter((u) => u.role === "TECHNICIEN"))
        setError(null)
      })
      .catch((e) => {
        if (!actif) return
        setError(
          e instanceof ApiError
            ? e.message
            : "Impossible de charger les techniciens.",
        )
      })
      .finally(() => {
        if (actif) setIsLoading(false)
      })
    return () => {
      actif = false
    }
  }, [])

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed p-8 text-sm text-muted-foreground">
        {error}
      </div>
    )
  }

  if (techniciens.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed p-8 text-sm text-muted-foreground">
        Aucun technicien pour le moment.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <BarreRecherche
        valeur={rp.recherche}
        onChange={rp.setRecherche}
        placeholder="Rechercher un technicien…"
      />
      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Missions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rp.visibles.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-24 text-center text-muted-foreground"
                >
                  Aucun technicien ne correspond à la recherche.
                </TableCell>
              </TableRow>
            )}
            {rp.visibles.map((t) => (
            <TableRow key={t.id}>
              <TableCell className="font-medium">
                <Link
                  href={`/dashboard/techniciens/${t.id}`}
                  className="hover:underline"
                >
                  {t.prenom} {t.nom}
                </Link>
              </TableCell>
              <TableCell className="text-muted-foreground">{t.email}</TableCell>
              <TableCell>
                <Badge variant={t.actif ? "default" : "secondary"}>
                  {t.actif ? "Actif" : "Inactif"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/dashboard/techniciens/${t.id}`}>
                    Gérer les missions
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </div>

      <PaginationTable
        page={rp.page}
        totalPages={rp.totalPages}
        totalFiltres={rp.totalFiltres}
        pageSize={rp.pageSize}
        onPageChange={rp.setPage}
      />
    </div>
  )
}
