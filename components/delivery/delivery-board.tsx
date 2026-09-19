"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Navigation,
  Package,
  Phone,
  ChevronUp,
  ChevronDown,
  CheckCircle2,
  Bike,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRealtime } from "@/hooks/use-realtime";
import {
  startDelivery,
  markDelivered,
} from "@/app/delivery/actions";
import type { Address, Customer, DeliveryAssignment, OrderWithDetails } from "@/types";

export type AssignedDelivery = DeliveryAssignment & {
  orders: OrderWithDetails & { customer: Customer; address: Address };
};

export function DeliveryBoard({ initial }: { initial: AssignedDelivery[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [prev, setPrev] = useState(initial);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  if (prev !== initial) {
    setPrev(initial);
    // conservar el orden visual local si solo cambió la data
    const byId = new Map(initial.map((a) => [a.id, a]));
    const stillHere = items.filter((a) => byId.has(a.id)).map((a) => byId.get(a.id)!);
    const fresh = initial.filter((a) => !items.some((i) => i.id === a.id));
    setItems([...stillHere, ...fresh]);
  }

  // Realtime: cuando admin asigna/reasigna pedidos o cambian los estados
  useRealtime(
    "delivery-asignaciones",
    [{ table: "delivery_assignments" }, { table: "orders" }],
    () => router.refresh(),
    () => router.refresh(),
  );

  // Reordenamiento LOCAL exclusivamente: jamás cambia order_number ni el orden en la base
  const move = (index: number, dir: -1 | 1) => {
    setItems((list) => {
      const next = [...list];
      const [x] = next.splice(index, 1);
      next.splice(index + dir, 0, x);
      return next;
    });
  };

  const handleStart = async (a: AssignedDelivery) => {
    setLoadingId(a.id);
    const res = await startDelivery(a.id, a.orders.id);
    setLoadingId(null);
    if (res.error) toast.error(res.error);
    else {
      toast.success(`🛵 En camino con el pedido #${a.orders.order_number}`);
      router.refresh();
    }
  };

  const handleDelivered = async (a: AssignedDelivery) => {
    setLoadingId(a.id);
    const res = await markDelivered(a.id, a.orders.id);
    setLoadingId(null);
    setConfirmId(null);
    if (res.error) toast.error(res.error);
    else {
      toast.success(`✅ Pedido #${a.orders.order_number} entregado`);
      router.refresh();
    }
  };

  const mapsUrl = (address: Address) => {
    if (address.lat != null && address.lng != null) {
      return `https://www.google.com/maps/dir/?api=1&destination=${address.lat},${address.lng}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address.address)}`;
  };

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 p-4 pb-8">
      <p className="text-sm text-muted-foreground">
        {items.length} entrega(s) pendiente(s) · usa ▲▼ para ordenar tu ruta
      </p>

      {items.length === 0 && (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 py-16 text-center">
          <p className="text-5xl" aria-hidden>🛵</p>
          <p className="font-semibold">Sin entregas pendientes</p>
          <p className="text-sm text-muted-foreground">
            Cuando te asignen un pedido aparecerá aquí al instante.
          </p>
        </div>
      )}

      {items.map((a, idx) => {
        const order = a.orders;
        const onTheWay = a.status === "EN_CAMINO";
        const confirming = confirmId === a.id;
        return (
          <Card key={a.id} className="overflow-hidden border-2 border-foreground/10">
            <CardContent className="flex flex-col gap-3 p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-2xl font-black">
                    #{String(order.order_number).padStart(3, "0")}
                  </p>
                  <p className="font-medium">{order.customer.full_name}</p>
                  <a
                    href={`tel:${order.customer.phone}`}
                    className="inline-flex items-center gap-1 text-sm text-blux-600"
                  >
                    <Phone className="size-3.5" aria-hidden /> {order.customer.phone}
                  </a>
                </div>
                <div className="flex flex-col gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label="Subir en mi ruta"
                    disabled={idx === 0}
                    onClick={() => move(idx, -1)}
                  >
                    <ChevronUp className="size-4" aria-hidden />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label="Bajar en mi ruta"
                    disabled={idx === items.length - 1}
                    onClick={() => move(idx, +1)}
                  >
                    <ChevronDown className="size-4" aria-hidden />
                  </Button>
                </div>
              </div>

              <div className="rounded-lg bg-muted p-3 text-sm">
                <p className="font-medium">{order.address.address}</p>
                {order.address.reference && (
                  <p className="text-muted-foreground">Ref: {order.address.reference}</p>
                )}
                {order.address.lat != null && (
                  <Badge variant="secondary" className="mt-1">📍 GPS incluido</Badge>
                )}
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Package className="size-4 shrink-0" aria-hidden />
                <span className="truncate">
                  {order.items.map((i) => `${i.quantity}× ${i.product_name}`).join(", ")}
                </span>
              </div>

              <Button variant="secondary" size="lg" className="h-14 text-base" asChild>
                <a href={mapsUrl(order.address)} target="_blank" rel="noopener noreferrer">
                  <Navigation className="mr-2 size-5" aria-hidden /> NAVEGAR
                </a>
              </Button>

              {confirming ? (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-14 flex-1 text-base"
                    onClick={() => setConfirmId(null)}
                    disabled={loadingId === a.id}
                  >
                    Aún no
                  </Button>
                  <Button
                    size="lg"
                    className="h-14 flex-1 bg-green-600 text-base font-bold hover:bg-green-700"
                    onClick={() => handleDelivered(a)}
                    disabled={loadingId === a.id}
                  >
                    {loadingId === a.id ? "Guardando…" : "Sí, entregado"}
                  </Button>
                </div>
              ) : onTheWay ? (
                <Button
                  size="lg"
                  className="h-14 text-base font-bold bg-green-600 hover:bg-green-700"
                  onClick={() => setConfirmId(a.id)}
                >
                  <CheckCircle2 className="mr-2 size-5" aria-hidden /> ENTREGADO
                </Button>
              ) : (
                <Button
                  size="lg"
                  className="h-14 text-base font-bold"
                  disabled={loadingId === a.id}
                  onClick={() => handleStart(a)}
                >
                  <Bike className="mr-2 size-5" aria-hidden />
                  {loadingId === a.id ? "Saliendo…" : "SALIR A ENTREGAR"}
                </Button>
              )}
            </CardContent>
          </Card>
        );
      })}
    </main>
  );
}
