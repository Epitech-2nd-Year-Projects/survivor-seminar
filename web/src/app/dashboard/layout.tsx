import * as React from "react";

import { AppSidebar } from "@/components/app-sidebar";
import DynamicBreadcrumbs from "@/components/dynamic-breadcrumbs";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { redirect } from "next/navigation";
import { apiFetchServer } from "@/lib/api/http/server";
import type { ItemResponseDTO } from "@/lib/api/contracts/common";
import { mapUser, type UserDTO } from "@/lib/api/contracts/users";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    const res = await apiFetchServer<ItemResponseDTO<UserDTO>>(`/users/me`, {
      cache: "no-store",
    });
    /*
    const me = mapUser(res.data ?? (res as any).user);
    if (!me) { // TODO: Maybe check for role?
      redirect('/');
    }*/
  } catch (e) {
    redirect(`/login?next=/admin`);
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <DynamicBreadcrumbs
            basePath="/dashboard"
            rootLabel="Dashboard"
            titleMap={{
              statistics: "Statistics",
              messages: "Messages",
            }}
          />
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
