"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "../lib/utils";
import { Button } from "../components/ui/button";
import { MenuIcon } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "../components/ui/sheet";

const routes = [
  { href: "/", label: "Home" },
  { href: "/compare", label: "Compare Players" },
  { href: "/predict", label: "Predict Value" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-blue-100 bg-white shadow-sm">
      <div className="container flex h-14 items-center justify-between">
        {/* Logo on the extreme left */}
        <div className="flex items-center">
          <Link href="/">
            <img
              src="/logo.png"
              alt="StatValue AI Logo"
              className="h-8 w-auto"
            />
          </Link>
          <span className="hidden font-bold text-gray-800 sm:inline-block ml-2">
            StatValue AI
          </span>
        </div>

        {/* Navigation Links in the center */}
        <div className="hidden md:flex items-center space-x-10 mx-auto">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "transition-colors hover:text-blue-600",
                pathname === route.href
                  ? "text-blue-600 font-medium"
                  : "text-gray-600"
              )}
            >
              {route.label}
            </Link>
          ))}
        </div>

        {/* Login and Signup buttons on the extreme right */}
        <div className="hidden md:flex items-center space-x-4">
          <Link href="/login">
            <Button
              variant="outline"
              className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
            >
              Login
            </Button>
          </Link>
          <Link href="/register">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              Sign Up
            </Button>
          </Link>
        </div>

        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-600 hover:text-blue-600 hover:bg-blue-50"
            >
              <MenuIcon className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="bg-white border-r border-blue-100"
          >
            <nav className="flex flex-col space-y-4 pt-8">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  className={cn(
                    "p-2 rounded-md transition-colors",
                    pathname === route.href
                      ? "text-blue-600 font-medium bg-blue-50"
                      : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                  )}
                >
                  {route.label}
                </Link>
              ))}
              <div className="mt-4 flex flex-col space-y-2 pt-4 border-t border-blue-100">
                <Link href="/login">
                  <Button
                    variant="outline"
                    className="w-full border-blue-200 text-blue-600 hover:bg-blue-50"
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    Sign Up
                  </Button>
                </Link>
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
