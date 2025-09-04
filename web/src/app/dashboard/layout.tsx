import * as React from "react"

import { AppSidebar } from "@/components/app-sidebar"
import DynamicBreadcrumbs from "@/components/dynamic-breadcrumbs";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

export default function DashboardLayout({ children, }: {children: React.ReactNode;}) {
  return (
    <SidebarProvider>
      <AppSidebar/>
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <DynamicBreadcrumbs basePath="/dashboard" rootLabel="Dashboard" titleMap={{
            statistics: "Statistics",
            messages: "Messages",
          }} />
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
