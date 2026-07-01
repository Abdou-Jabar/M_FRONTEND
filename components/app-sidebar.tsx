"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import { useAuth } from "@/lib/auth/use-auth"
import { ROLES_EQUIPE, type Role } from "@/lib/auth/types"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { LayoutDashboardIcon, MapIcon, CpuIcon, RadioIcon, UsersIcon, CameraIcon, FileTextIcon, Settings2Icon, CircleHelpIcon, SearchIcon, LeafIcon, Building2Icon, GaugeIcon, HardHatIcon, WrenchIcon, ClipboardListIcon } from "lucide-react"

// Élément de navigation principal.
// `roles` liste les rôles autorisés à voir l'élément. Si absent, visible par tous.
// Ajuste cette table selon tes règles métier.
type NavItem = {
  title: string
  url: string
  icon?: React.ReactNode
  roles?: Role[]
}

const data = {
  navMainClient: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: (
        <LayoutDashboardIcon
        />
      ),
    },
    {
      title: "Parcelles",
      url: "/dashboard/parcelles",
      icon: (
        <MapIcon
        />
      ),
    },
    {
      title: "Dispositifs",
      url: "/dashboard/dispositifs",
      icon: (
        <CpuIcon
        />
      ),
      roles: ["ADMIN"],
    },
    {
      title: "Capteurs",
      url: "/dashboard/capteurs",
      icon: (
        <RadioIcon
        />
      ),
      roles: ["ADMIN"],
    },
    {
      title: "Utilisateurs",
      url: "/dashboard/utilisateurs",
      icon: (
        <UsersIcon
        />
      ),
      roles: ["ADMIN"],
    },
  ] as NavItem[],
  navMainEquipe: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: (
        <LayoutDashboardIcon
        />
      ),
    },
    {
      title: "Organisations",
      url: "/dashboard/organisations",
      icon: (
        <Building2Icon
        />
      ),
      roles: ["SUPERVISEUR"],
    },
    {
      title: "Techniciens",
      url: "/dashboard/techniciens",
      icon: (
        <HardHatIcon
        />
      ),
      roles: ["SUPERVISEUR"],
    },
    {
      title: "Missions",
      url: "/dashboard/missions",
      icon: (
        <ClipboardListIcon
        />
      ),
      roles: ["SUPERVISEUR"],
    },
    {
      title: "Utilisateurs",
      url: "/dashboard/utilisateurs",
      icon: (
        <UsersIcon
        />
      ),
      roles: ["SUPERVISEUR"],
    },
    {
      title: "Seuils",
      url: "/dashboard/seuils",
      icon: (
        <GaugeIcon
        />
      ),
      roles: ["SUPERVISEUR"],
    },
    {
      title: "Installation",
      url: "/dashboard/installation",
      icon: (
        <WrenchIcon
        />
      ),
      roles: ["TECHNICIEN"],
    },
    {
      title: "Mes missions",
      url: "/dashboard/mes-missions",
      icon: (
        <ClipboardListIcon
        />
      ),
      roles: ["TECHNICIEN"],
    },
  ] as NavItem[],
  navClouds: [
    {
      title: "Capture",
      icon: (
        <CameraIcon
        />
      ),
      isActive: true,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Proposal",
      icon: (
        <FileTextIcon
        />
      ),
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Prompts",
      icon: (
        <FileTextIcon
        />
      ),
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: (
        <Settings2Icon
        />
      ),
    },
    {
      title: "Get Help",
      url: "#",
      icon: (
        <CircleHelpIcon
        />
      ),
    },
    {
      title: "Search",
      url: "#",
      icon: (
        <SearchIcon
        />
      ),
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter()
  const { user, logout } = useAuth()

  // Données d'affichage de l'utilisateur connecté (avec repli si non chargé).
  const displayUser = {
    name: user ? `${user.prenom} ${user.nom}`.trim() : "Utilisateur",
    email: user?.email ?? "",
    avatar: "",
  }

  function handleLogout() {
    logout()
    router.replace("/login")
  }

  // Navigation selon l'espace : équipe AgriSmart ou client.
  const estEquipe = user != null && ROLES_EQUIPE.includes(user.role)
  const navSource = estEquipe ? data.navMainEquipe : data.navMainClient
  const navItems = navSource.filter(
    (item) => !item.roles || (user != null && item.roles.includes(user.role)),
  )

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <a href="/dashboard">
                <LeafIcon className="size-5!" />
                <span className="text-base font-semibold">AgriSmart</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={displayUser} onLogout={handleLogout} />
      </SidebarFooter>
    </Sidebar>
  )
}
