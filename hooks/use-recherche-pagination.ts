"use client"

// Recherche textuelle + pagination côté client pour les tableaux.
// Le reset de page se fait dans le setter (pas d'effet), et la page est
// bornée au rendu quand la liste rétrécit (suppression d'éléments).

import { useMemo, useState } from "react"

function normaliser(texte: string): string {
  return texte
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
}

export function useRecherchePagination<T>(
  items: T[],
  extraireTexte: (item: T) => string,
  pageSize = 10,
) {
  const [recherche, setRechercheBrute] = useState("")
  const [page, setPage] = useState(0)

  function setRecherche(valeur: string) {
    setRechercheBrute(valeur)
    setPage(0)
  }

  const filtres = useMemo(() => {
    const terme = normaliser(recherche.trim())
    if (!terme) return items
    return items.filter((item) =>
      normaliser(extraireTexte(item)).includes(terme),
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, recherche])

  const totalPages = Math.max(1, Math.ceil(filtres.length / pageSize))
  const pageEffective = Math.min(page, totalPages - 1)
  const visibles = filtres.slice(
    pageEffective * pageSize,
    (pageEffective + 1) * pageSize,
  )

  return {
    recherche,
    setRecherche,
    page: pageEffective,
    setPage,
    visibles,
    totalFiltres: filtres.length,
    totalPages,
    pageSize,
  }
}
