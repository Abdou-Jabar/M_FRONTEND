"use client"

// Cloche de notifications avec badge de compteur non lu.
// Ouvre un panneau (Sheet) listant les notifications du ticket.
// Se rafraîchit automatiquement toutes les 60 secondes.

import { useEffect, useState } from "react"
import Link from "next/link"
import { BellIcon, CheckCheckIcon, InboxIcon } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { ApiError } from "@/lib/api"
import {
  compterNotificationsNonLues,
  getNotifications,
  marquerNotificationsLues,
} from "@/lib/tickets/ticket-service"
import type { NotificationTicketResponse } from "@/lib/tickets/types"

// Intervalle de rafraîchissement automatique (ms).
const REFRESH_INTERVAL_MS = 60_000

function formaterDate(iso: string): string {
  return new Date(iso).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function NotificationBell() {
  const [compteur, setCompteur] = useState(0)
  const [ouvert, setOuvert] = useState(false)
  const [notifs, setNotifs] = useState<NotificationTicketResponse[]>([])
  const [chargement, setChargement] = useState(false)
  const [marquage, setMarquage] = useState(false)

  // Rafraîchit le compteur en arrière-plan.
  useEffect(() => {
    let actif = true

    function rafraichirCompteur() {
      compterNotificationsNonLues()
        .then((n) => { if (actif) setCompteur(n) })
        .catch(() => { /* silencieux — badge non critique */ })
    }

    rafraichirCompteur()
    const timer = setInterval(rafraichirCompteur, REFRESH_INTERVAL_MS)
    return () => {
      actif = false
      clearInterval(timer)
    }
  }, [])

  // Charge les notifications à l'ouverture du panneau.
  useEffect(() => {
    if (!ouvert) return
    let actif = true

    // Démarrer le chargement dans un microtask pour éviter un setState
    // synchrone dans le corps de l'effet (règle react-hooks/set-state-in-effect).
    Promise.resolve().then(() => {
      if (!actif) return
      setChargement(true)
      getNotifications(0, 30)
        .then((page) => { if (actif) setNotifs(page.content) })
        .catch((e) => {
          if (!actif) return
          toast.error(
            e instanceof ApiError ? e.message : "Impossible de charger les notifications.",
          )
        })
        .finally(() => { if (actif) setChargement(false) })
    })

    return () => { actif = false }
  }, [ouvert])

  async function handleMarquerLues() {
    setMarquage(true)
    try {
      await marquerNotificationsLues()
      setCompteur(0)
      setNotifs((prev) => prev.map((n) => ({ ...n, lu: true })))
      toast.success("Toutes les notifications sont marquées comme lues.")
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Action impossible.")
    } finally {
      setMarquage(false)
    }
  }

  return (
    <Sheet open={ouvert} onOpenChange={setOuvert}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative size-8"
          aria-label={`Notifications${compteur > 0 ? ` (${compteur} non lue${compteur > 1 ? "s" : ""})` : ""}`}
        >
          <BellIcon className="size-4" />
          {compteur > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full p-0 text-[10px] font-semibold leading-none"
            >
              {compteur > 99 ? "99+" : compteur}
            </Badge>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent className="flex w-full flex-col gap-0 sm:max-w-md">
        <SheetHeader className="border-b px-6 py-4">
          <div className="flex items-center justify-between gap-2">
            <SheetTitle>Notifications</SheetTitle>
            {compteur > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarquerLues}
                disabled={marquage}
                className="text-xs"
              >
                <CheckCheckIcon className="size-3.5" />
                {marquage ? "Marquage…" : "Tout marquer lues"}
              </Button>
            )}
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          {chargement ? (
            <div className="flex flex-col gap-3 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          ) : notifs.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 p-10 text-muted-foreground">
              <InboxIcon className="size-10 opacity-30" />
              <p className="text-sm">Aucune notification.</p>
            </div>
          ) : (
            <div className="flex flex-col divide-y">
              {notifs.map((n) => (
                <Link
                  key={n.id}
                  href={`/dashboard/tickets/${n.ticketId}`}
                  onClick={() => setOuvert(false)}
                  className={cn(
                    "flex flex-col gap-1 px-6 py-4 transition-colors hover:bg-muted/50",
                    !n.lu && "bg-muted/30",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-medium text-primary">
                      Ticket #{n.ticketId}
                    </span>
                    {!n.lu && (
                      <span className="mt-0.5 size-2 shrink-0 rounded-full bg-primary" />
                    )}
                  </div>
                  <p className="text-sm leading-snug">{n.message}</p>
                  <span className="text-xs text-muted-foreground">
                    {formaterDate(n.createdAt)}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <Separator />
        <div className="px-6 py-3 text-center">
          <Link
            href="/dashboard/tickets"
            onClick={() => setOuvert(false)}
            className="text-xs text-primary hover:underline"
          >
            Voir tous mes tickets
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  )
}
