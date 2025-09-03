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
      title: "Admin Area",
      perm: "adminArea",
      items: [
        { title: "Dashboard", href: "/dashboard/statistics" },
        { title: "Admin Back Office", href: "/dashboard/admin-bak-office" },
        { title: "Content Management", href: "/dashboard/content" },
        { title: "User Management", href: "/dashboard/user-Management" },
        // { title: "Users", href: "/dashboard/admin/users", perm: "adminArea" }, // exemple d'item protégé
      ],
    },
    {
      title: "Satrupt Area",
      perm: "startupArea",
      items: [{ title: "Messages", href: "/dashboard/messages" }],
    },
  ],
};

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  return (
    <Sidebar {...props}>
      <SidebarHeader>
      </SidebarHeader>
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
                            <Link href={item.href}>{item.title}</Link>
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
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
