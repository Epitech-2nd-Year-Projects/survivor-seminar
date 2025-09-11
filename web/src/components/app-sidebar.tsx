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
import {
  LayoutDashboard,
  Mail,
  NotebookTextIcon,
  ShieldUser,
} from "lucide-react";
import { useMe } from "@/lib/api/services/auth/hooks";
import { UserRole } from "@/lib/api/contracts/users";

type NavItem = {
  title: string;
  href: string;
  icon?: React.ReactNode;
};

type NavGroup = {
  title: string;
  allowedRoles?: UserRole[];
  items: NavItem[];
};

const navData: {
  navMain: NavGroup[];
} = {
  navMain: [
    {
      title: "Admin",
      allowedRoles: [UserRole.Admin],
      items: [
        {
          title: "Statistics",
          href: "/dashboard/statistics",
          icon: <LayoutDashboard />,
        },
        {
          title: "Back Office",
          href: "/dashboard/back-office",
          icon: <ShieldUser />,
        },
      ],
    },
    {
      title: "Startup",
      allowedRoles: [UserRole.Admin, UserRole.Founder],
      items: [
        {
          title: "My Profile",
          href: "/dashboard/my-profile",
          icon: <NotebookTextIcon />,
        },
      ],
    },
    {
      title: "Messaging",
      allowedRoles: [UserRole.Investor, UserRole.Founder],
      items: [
        {
          title: "Conversations",
          href: "/dashboard/conversations",
          icon: <Mail />,
        },
      ],
    },
  ],
};

function canAccessGroup(userRole: UserRole, groupRoles?: UserRole[]) {
  if (!groupRoles) return true;
  const groupRole = groupRoles.find((role) => role === userRole);
  return groupRole !== undefined;
}

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { data: user, isLoading, error } = useMe();

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
        {navData.navMain
          .filter((group) => canAccessGroup(user.role, group.allowedRoles))
          .map((group) => (
            <SidebarGroup key={group.title}>
              <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => {
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
