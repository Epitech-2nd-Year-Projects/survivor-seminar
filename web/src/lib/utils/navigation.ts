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
        { title: "Statistics", href: "/dashboard/statistics", icon: undefined },
        {
          title: "Back Office",
          href: "/dashboard/back-office",
          icon: undefined,
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
          icon: undefined,
        },
        {
          title: "Conversations",
          href: "/dashboard/conversations",
          icon: undefined,
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
          icon: undefined,
        },
      ],
    },
  ],
};

function canAccessGroup(userRole: UserRole, groupRoles?: UserRole[]) {
  if (!groupRoles) return true;
  return groupRoles.includes(userRole);
}

export function getFirstAllowedPage(userRole: UserRole): string {
  const allowedGroups = navData.navMain.filter((group) =>
    canAccessGroup(userRole, group.allowedRoles),
  );

  const firstPageHref = allowedGroups[0]?.items[0]?.href;

  if (firstPageHref) {
    return firstPageHref;
  }

  return "/";
}
