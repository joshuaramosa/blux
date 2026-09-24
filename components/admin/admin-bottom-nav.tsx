"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  UtensilsCrossed,
  Users,
  TrendingUp,
  Settings,
  Megaphone,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    label: "Inicio",
    href: "/admin",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: "Pedidos",
    href: "/admin/pedidos",
    icon: ShoppingBag,
    exact: false,
  },
  {
    label: "Carta",
    href: "/admin/productos",
    icon: UtensilsCrossed,
    exact: false,
  },
  {
    label: "Clientes",
    href: "/admin/clientes",
    icon: Users,
    exact: false,
  },
  {
    label: "Ventas",
    href: "/admin/ventas",
    icon: TrendingUp,
    exact: false,
  },
  {
    label: "Promos",
    href: "/admin/promociones",
    icon: Megaphone,
    exact: false,
  },
  {
    label: "Ajustes",
    href: "/admin/configuracion",
    icon: Settings,
    exact: false,
  },
];

export function AdminBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur-md pb-safe">
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-1.5">
        {NAV_ITEMS.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 rounded-lg py-1 text-[11px] font-medium transition-colors touch-manipulation active:scale-95",
                isActive
                  ? "text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full transition-all",
                  isActive && "bg-primary/10"
                )}
              >
                <Icon className={cn("h-4 w-4", isActive && "stroke-[2.5px]")} />
              </div>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
