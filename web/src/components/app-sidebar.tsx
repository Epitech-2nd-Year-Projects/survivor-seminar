"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { LayoutDashboard, Mail, Pencil, ShieldUser, Users } from "lucide-react";
import { useCurrentUser } from "@/hooks/useCurrentUser";

type User = {
  name: string;
  email: string;
  avatar: string;
  adminArea?: boolean;
  startupArea?: boolean;
};

type NavItem = {
  title: string;
  href: string;
  perm?: keyof User;
  icon?: React.ReactNode;
};

type NavGroup = {
  title: string;
  perm?: keyof User;
  items: NavItem[];
};

const data: {
  versions: string[];
  user: User;
  navMain: NavGroup[];
} = {
  versions: ["1.0.1", "1.1.0-alpha", "2.0.0-beta1"],
  user: {
    name: "Laurent",
    email: "laurent.aliu@epitech.eu",
    avatar: "https://github.com/shadcn.png",
    adminArea: true,
    startupArea: true,
  },
  navMain: [
    {
      title: "Admin",
      perm: "adminArea",
      items: [
        { title: "Dashboard", href: "/dashboard/", icon: <LayoutDashboard /> },
        {
          title: "Back Office",
          href: "/dashboard/back-office",
          icon: <ShieldUser />,
        },
        {
          title: "Content Management",
          href: "/dashboard/content-management",
          icon: <Pencil />,
        },
        {
          title: "User Management",
          href: "/dashboard/user-management",
          icon: <Users />,
        },
        // { title: "Users", href: "/dashboard/admin/users", perm: "adminArea" }, // exemple d'item protégé
      ],
    },
    {
      title: "Startup",
      perm: "startupArea",
      items: [
        { title: "Messages", href: "/dashboard/messages", icon: <Mail /> },
      ],
    },
  ],
};

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { data: user, isLoading, error } = useCurrentUser();

  if (isLoading) {
    return (
      <Sidebar {...props}>
        <SidebarContent>
          <div className="p-4">Loading…</div>
        </SidebarContent>
      </Sidebar>
    );
  }

  if (error || !user) {
    return (
      <Sidebar {...props}>
        <SidebarContent>
          <div className="p-4 text-sm text-red-600">Unable to load user</div>
        </SidebarContent>
      </Sidebar>
    );
  }

  return (
    <Sidebar {...props}>
      <SidebarHeader></SidebarHeader>
      <SidebarContent>
        {data.navMain
          .filter((group) => !group.perm || data.user[group.perm])
          .map((group) => (
            <SidebarGroup key={group.title}>
              <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items
                    .filter((item) => !item.perm || data.user[item.perm])
                    .map((item) => {
                      const isActive =
                        pathname === item.href ||
                        pathname.startsWith(item.href + "/");
                      return (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton asChild isActive={isActive}>
                            <Link href={item.href}>
                              {item.icon}
                              {item.title}
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
