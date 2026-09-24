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
    roles: null, // ambos roles del panel
  },
  {
    label: "Pedidos",
    href: "/admin/pedidos",
    icon: ShoppingBag,
    exact: false,
    roles: null,
  },
  {
    label: "Carta",
    href: "/admin/productos",
    icon: UtensilsCrossed,
    exact: false,
    roles: ["ADMIN"],
  },
  {
    label: "Clientes",
    href: "/admin/clientes",
    icon: Users,
    exact: false,
    roles: null,
  },
  {
    label: "Ventas",
    href: "/admin/ventas",
    icon: TrendingUp,
    exact: false,
    roles: ["ADMIN"],
  },
  {
    label: "Promos",
    href: "/admin/promociones",
    icon: Megaphone,
    exact: false,
    roles: ["ADMIN"],
  },
  {
    label: "Ajustes",
    href: "/admin/configuracion",
    icon: Settings,
    exact: false,
    roles: ["ADMIN"],
  },
];

export function AdminBottomNav({ role = "ADMIN" }: { role?: string }) {
  const pathname = usePathname();
  // Solo mostrar los módulos que el rol realmente puede usar
  const items = NAV_ITEMS.filter((i) => !i.roles || i.roles.includes(role));

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur-md pb-safe">
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-1.5">
        {items.map((item) => {
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
