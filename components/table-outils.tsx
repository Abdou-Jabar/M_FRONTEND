"use client"

// Barre de recherche + pagination partagées par les tableaux.

import { ChevronLeftIcon, ChevronRightIcon, SearchIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function BarreRecherche({
  valeur,
  onChange,
  placeholder = "Rechercher…",
}: {
  valeur: string
  onChange: (valeur: string) => void
  placeholder?: string
}) {
  return (
    <div className="relative w-full max-w-xs">
      <SearchIcon className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        value={valeur}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-8"
      />
    </div>
  )
}

export function PaginationTable({
  page,
  totalPages,
  totalFiltres,
  pageSize,
  onPageChange,
}: {
  page: number
  totalPages: number
  totalFiltres: number
  pageSize: number
  onPageChange: (page: number) => void
}) {
  if (totalFiltres === 0) return null

  const debut = page * pageSize + 1
  const fin = Math.min((page + 1) * pageSize, totalFiltres)

  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-muted-foreground">
        {debut}–{fin} sur {totalFiltres}
      </span>
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            disabled={page === 0}
            onClick={() => onPageChange(page - 1)}
            aria-label="Page précédente"
          >
            <ChevronLeftIcon className="size-4" />
          </Button>
          <span className="px-2 text-xs tabular-nums text-muted-foreground">
            {page + 1} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            disabled={page >= totalPages - 1}
            onClick={() => onPageChange(page + 1)}
            aria-label="Page suivante"
          >
            <ChevronRightIcon className="size-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
