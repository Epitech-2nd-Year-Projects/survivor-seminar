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
  MilestoneIcon,
  NotebookTextIcon,
  Pencil,
  ShieldUser,
  Users,
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
  requiredRole?: UserRole;
  items: NavItem[];
};

const navData: {
  navMain: NavGroup[];
} = {
  navMain: [
    {
      title: "Admin",
      requiredRole: UserRole.Admin,
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
      ],
    },
    {
      title: "Startup",
      requiredRole: UserRole.Founder,
      items: [
        {
          title: "My Profile",
          href: "/dashboard/startup-area",
          icon: <NotebookTextIcon />,
        },
        {
          title: "Conversations",
          href: "/dashboard/conversations",
          icon: <Mail />,
        },
        {
          title: "Opportunities",
          href: "/dashboard/startup-area/opportunities",
          icon: <MilestoneIcon />,
        },
      ],
    },
  ],
};

function canAccessGroup(userRole: UserRole, groupRole?: UserRole) {
  if (!groupRole) return true;
  if (userRole === UserRole.Admin) return true;
  return userRole === groupRole;
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
          .filter((group) => canAccessGroup(user.role, group.requiredRole))
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
