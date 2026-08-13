// Journal d'audit (traces des actions sensibles) — réservé au SUPERVISEUR.
// Aligné sur AuditController / AuditLogResponse côté backend.

import { apiFetch } from "@/lib/api"

export interface AuditLog {
  id: number
  action: string
  details: string | null
  utilisateurId: number | null
  utilisateurNom: string | null
  utilisateurRole: string | null
  organisationId: number | null
  organisationNom: string | null
  date: string
}

export interface PageAudit {
  content: AuditLog[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

// GET /api/audit — journal global (toutes organisations).
export function getJournalAudit(page = 0, size = 50): Promise<PageAudit> {
  return apiFetch<PageAudit>(`/audit?page=${page}&size=${size}`)
}

// GET /api/audit/organisation/{id} — journal d'une organisation.
export function getJournalAuditOrganisation(
  organisationId: number,
  page = 0,
  size = 50,
): Promise<PageAudit> {
  return apiFetch<PageAudit>(
    `/audit/organisation/${organisationId}?page=${page}&size=${size}`,
  )
}
