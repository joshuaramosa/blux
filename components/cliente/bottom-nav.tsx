"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, ReceiptText, CircleUserRound } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/", label: "Inicio", icon: Home, exact: true },
  { href: "/carta", label: "Carta", icon: BookOpen, exact: false },
  { href: "/mis-pedidos", label: "Pedidos", icon: ReceiptText, exact: false },
  { href: "/perfil", label: "Perfil", icon: CircleUserRound, exact: false },
];

const ACTIVE = "text-[#f04e1e]";

/** Barra de navegación inferior fija para la zona pública del cliente. */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegación principal del cliente"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur pb-[env(safe-area-inset-bottom)]"
    >
      <div className="mx-auto flex max-w-md items-stretch justify-between px-2">
        {TABS.map((tab) => {
          const active = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 px-2 py-3 text-[11px] font-bold transition-colors",
                active ? ACTIVE : "text-stone-400 hover:text-stone-700",
              )}
            >
              <Icon className={cn("size-6", active ? "fill-[#f04e1e]/15 stroke-[2.2]" : "")} aria-hidden />
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
