"use client";
import { ChevronsDown, Menu } from "lucide-react";
import React from "react";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { Separator } from "../ui/separator";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "../ui/navigation-menu";
import Link from "next/link";
import { Button } from "../ui/button";
import { ToggleTheme } from "../ui/toggle-theme";

interface RouteProps {
  href: string;
  label: string;
}

interface FeaturedProjectProps {
  title: string;
  description: string;
}

const routeList: RouteProps[] = [
  {
    href: "#news",
    label: "News",
  },
  {
    href: "#events",
    label: "Events",
  },
  {
    href: "#about",
    label: "About",
  },
  {
    href: "#contact",
    label: "Contact",
  },
];

const featuredProjectList: FeaturedProjectProps[] = [
  {
    title: "Spotify",
    description:
      "Spotify is a music streaming service that offers a wide range of music genres and allows users to create personalized playlists.",
  },
  {
    title: "Netflix",
    description:
      "Netflix is a streaming service that offers a wide range of TV shows and movies, as well as original content.",
  },
  {
    title: "YouTube",
    description:
      "YouTube is a video streaming service that offers a wide range of videos, including music, educational content, and entertainment.",
  },
];

export const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <header className="bg-opacity-15 border-secondary bg-card sticky top-5 z-40 mx-auto flex w-[90%] items-center justify-between rounded-2xl border p-2 shadow-inner md:w-[70%] lg:w-[75%] lg:max-w-screen-xl">
      <Link href="/" className="flex items-center text-lg font-bold">
        <ChevronsDown className="border-secondary from-primary via-primary/70 to-primary mr-2 h-9 w-9 rounded-lg border bg-gradient-to-tr text-white" />
        Survivor
      </Link>
      {/* Mobile navigation */}
      <div className="flex items-center lg:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Menu
              onClick={() => setIsOpen(!isOpen)}
              className="cursor-pointer lg:hidden"
            />
          </SheetTrigger>

          <SheetContent
            side="left"
            className="bg-card border-secondary flex flex-col justify-between rounded-tr-2xl rounded-br-2xl"
          >
            <div>
              <SheetHeader className="mb-4 ml-4">
                <SheetTitle className="flex items-center">
                  <Link href="/" className="flex items-center">
                    <ChevronsDown className="border-secondary from-primary via-primary/70 to-primary mr-2 h-9 w-9 rounded-lg border bg-gradient-to-tr text-white" />
                    Survivor
                  </Link>
                </SheetTitle>
              </SheetHeader>

              <div className="flex flex-col gap-2">
                {routeList.map(({ href, label }) => (
                  <Button
                    key={href}
                    onClick={() => setIsOpen(false)}
                    asChild
                    variant="ghost"
                    className="justify-start text-base"
                  >
                    <Link href={href}>{label}</Link>
                  </Button>
                ))}
              </div>
            </div>

            <SheetFooter className="flex-col items-start justify-start sm:flex-col">
              <Separator className="mb-2" />

              <ToggleTheme />
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
      {/* End of mobile navigation */}

      {/* Desktop navigation */}
      <NavigationMenu className="mx-auto hidden lg:block">
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger className="bg-card text-base">
              Projects
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="grid w-[600px] grid-cols-2 gap-5 p-4">
                <ul className="flex flex-col gap-2">
                  {featuredProjectList.map(({ title, description }) => (
                    <li
                      key={title}
                      className="hover:bg-muted rounded-md p-3 text-sm"
                    >
                      <p className="text-foreground mb-1 leading-none font-semibold">
                        {title}
                      </p>
                      <p className="text-muted-foreground line-clamp-2">
                        {description}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>

          {routeList.map(({ href, label }) => (
            <NavigationMenuItem key={href}>
              <NavigationMenuLink asChild>
                <Link href={href} className="px-2 text-base">
                  {label}
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>

      <div className="hidden lg:flex">
        <ToggleTheme />
      </div>
      {/* End of desktop navigation */}
    </header>
  );
};
