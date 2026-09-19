"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useCart, useCartSubtotal } from "@/hooks/use-cart";
import { useMounted } from "@/hooks/use-mounted";
import { createClient } from "@/lib/supabase/client";
import { formatSoles } from "@/lib/business";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BluxLogo } from "@/components/ui/blux-logo";

export function CartView({ deliveryFee }: { deliveryFee: number }) {
  const { items, increment, decrement, removeItem } = useCart();
  const subtotal = useCartSubtotal();

  // Hidratación segura con localStorage
  const mounted = useMounted();

  // Revalidación contra la base: ids agotados o eliminados de la carta
  const [unavailable, setUnavailable] = useState<string[]>([]);
  const ids = useMemo(() => items.map((i) => i.productId), [items]);

  useEffect(() => {
    if (!mounted || ids.length === 0) return;
    const supabase = createClient();
    supabase
      .from("products")
      .select("id, is_available")
      .in("id", ids)
      .then(({ data }) => {
        const active = new Set(
          (data ?? []).filter((p) => p.is_available).map((p) => p.id),
        );
        setUnavailable(ids.filter((id) => !active.has(id)));
      });
  }, [mounted, ids]);

  if (!mounted) {
    return <main className="flex-1 p-4 text-center text-muted-foreground">Cargando…</main>;
  }

  if (items.length === 0) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-6xl" aria-hidden>🛒</p>
        <h2 className="text-lg font-semibold">Tu carrito está vacío</h2>
        <p className="text-sm text-muted-foreground">
          Agrega algo rico de nuestra carta para empezar tu pedido.
        </p>
        <Button asChild size="lg" className="mt-2">
          <Link href="/carta">Ver la carta</Link>
        </Button>
      </main>
    );
  }

  const hasUnavailable = unavailable.length > 0;
  const total = subtotal + deliveryFee;

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-3 p-4 pb-8">
      {hasUnavailable && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          Algunos productos de tu carrito ya no están disponibles. Elimínalos para continuar.
        </div>
      )}

      {items.map((item) => {
        const isUnavailable = unavailable.includes(item.productId);
        return (
          <Card key={item.productId} className={isUnavailable ? "opacity-60" : ""}>
            <CardContent className="flex items-center gap-3 p-3">
              <div className="relative size-16 shrink-0 overflow-hidden rounded-md bg-blux-50">
                {item.imageUrl ? (
                  <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-500/10 via-red-500/5 to-transparent p-1">
                    <BluxLogo size="xs" priority={false} />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{item.name}</p>
                {isUnavailable && (
                  <p className="text-xs font-medium text-destructive">No disponible</p>
                )}
                <p className="text-sm text-blux-600">{formatSoles(item.price)}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 rounded-full border">
                  <button
                    aria-label={`Quitar uno de ${item.name}`}
                    className="px-2.5 py-1.5 text-lg leading-none"
                    onClick={() => decrement(item.productId)}
                  >
                    −
                  </button>
                  <span className="w-6 text-center font-semibold">{item.quantity}</span>
                  <button
                    aria-label={`Agregar uno de ${item.name}`}
                    className="px-2.5 py-1.5 text-lg leading-none"
                    onClick={() => increment(item.productId)}
                  >
                    +
                  </button>
                </div>
                <button
                  aria-label={`Eliminar ${item.name}`}
                  className="p-2 text-muted-foreground hover:text-destructive"
                  onClick={() => {
                    removeItem(item.productId);
                    toast.info(`${item.name} eliminado del carrito`);
                  }}
                >
                  <Trash2 className="size-4" aria-hidden />
                </button>
              </div>
            </CardContent>
          </Card>
        );
      })}

      <div className="mt-2 space-y-1.5 rounded-lg border p-4 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <span>Subtotal</span>
          <span>{formatSoles(subtotal)}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Delivery</span>
          <span>{formatSoles(deliveryFee)}</span>
        </div>
        <div className="flex justify-between border-t pt-2 text-base font-bold">
          <span>Total</span>
          <span className="text-blux-600">{formatSoles(total)}</span>
        </div>
      </div>

      <Button
        size="lg"
        className="mt-2 w-full text-base"
        disabled={hasUnavailable}
        asChild={!hasUnavailable}
      >
        {hasUnavailable ? "Revisa tu carrito" : <Link href="/checkout">CONTINUAR</Link>}
      </Button>
    </main>
  );
}
