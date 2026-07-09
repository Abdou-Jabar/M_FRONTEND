"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { CirclePlusIcon } from "lucide-react"

// Action de création rapide affichée en haut de la navigation.
// Fournie uniquement pour les rôles autorisés (sinon le bouton n'apparaît pas).
export type QuickCreate = {
  label: string
  url: string
}

export function NavMain({
  items,
  quickCreate,
}: {
  items: {
    title: string
    url: string
    icon?: React.ReactNode
  }[]
  quickCreate?: QuickCreate
}) {
  const pathname = usePathname()

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        {quickCreate && (
          <SidebarMenu>
            <SidebarMenuItem className="flex items-center gap-2">
              <SidebarMenuButton
                asChild
                tooltip={quickCreate.label}
                className="min-w-8 bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
              >
                <Link href={quickCreate.url}>
                  <CirclePlusIcon />
                  <span>{quickCreate.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
        <SidebarMenu>
          {items.map((item) => {
            // "Dashboard" (racine) : actif uniquement sur la route exacte.
            // Les autres : actifs sur leur route ou leurs sous-routes.
            const isActive =
              pathname === item.url ||
              (item.url !== "/dashboard" &&
                pathname.startsWith(`${item.url}/`))

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  isActive={isActive}
                >
                  <Link href={item.url}>
                    {item.icon}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
