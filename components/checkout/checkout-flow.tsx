"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { useCart, useCartSubtotal } from "@/hooks/use-cart";
import { useMounted } from "@/hooks/use-mounted";
import { createOrder } from "@/app/checkout/actions";
import { saveOrder } from "@/lib/order-memory";
import { getProfile, saveProfile } from "@/lib/customer-profile";
import { formatSoles } from "@/lib/business";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import type { BusinessSettings } from "@/types";

const LocationMap = dynamic(() => import("./location-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-52 w-full items-center justify-center rounded-lg bg-muted text-sm text-muted-foreground">
      Cargando mapa…
    </div>
  ),
});

const PHONE_RE = /^9\d{8}$/;

export function CheckoutFlow({ settings }: { settings: BusinessSettings | null }) {
  const { items, clear } = useCart();
  const subtotal = useCartSubtotal();
  const mounted = useMounted();

  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<{ token: string; number: number } | null>(null);

  // Precarga perezosa del perfil guardado en el teléfono (tab Perfil / compras previas).
  // Inicialización perezosa: evita setState dentro de un efecto.
  const [name, setName] = useState(() =>
    typeof window === "undefined" ? "" : getProfile()?.name ?? "",
  );
  const [phone, setPhone] = useState(() =>
    typeof window === "undefined" ? "" : getProfile()?.phone ?? "",
  );

  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsStatus, setGpsStatus] = useState<"idle" | "loading" | "error">("idle");
  const [reference, setReference] = useState(() =>
    typeof window === "undefined" ? "" : getProfile()?.reference ?? "",
  );

  const [paymentMethod, setPaymentMethod] = useState<"YAPE" | "CONTRA_ENTREGA" | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);

  const deliveryFee = Number(settings?.delivery_fee ?? 0);
  const total = subtotal + deliveryFee;

  useEffect(() => {
    return () => {
      if (proofPreview) URL.revokeObjectURL(proofPreview);
    };
  }, [proofPreview]);

  if (!mounted) return null;

  // ---------- Carrito vacío ----------
  if (!order && items.length === 0) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-6xl" aria-hidden>🛒</p>
        <h1 className="text-lg font-semibold">No tienes nada en tu carrito</h1>
        <Button asChild size="lg">
          <Link href="/carta">Ver la carta</Link>
        </Button>
      </main>
    );
  }

  // ---------- Pedido creado ----------
  if (order) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-6xl" aria-hidden>✅</p>
        <h1 className="text-2xl font-bold">¡Pedido recibido!</h1>
        <p className="text-lg">
          Tu pedido es el{" "}
          <span className="font-bold text-blux-600">#{String(order.number).padStart(3, "0")}</span>
        </p>
        <p className="text-sm text-muted-foreground">
          Te avisaremos cuando lo estemos preparando. Este pedido quedó guardado en tu teléfono.
        </p>
        <Button asChild size="lg" className="w-full max-w-xs">
          <Link href={`/pedido/${order.token}`}>Ver estado de mi pedido</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/mis-pedidos">Mis pedidos</Link>
        </Button>
        <Button asChild variant="ghost">
          <Link href="/carta">Volver a la carta</Link>
        </Button>
      </main>
    );
  }

  // ---------- Handlers ----------
  const showError = (msg: string) => {
    setError(msg);
    setTimeout(() => errorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
  };

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setGpsStatus("error");
      showError("Tu navegador no soporta GPS. Escríbenos tu dirección completa en la referencia.");
      return;
    }
    setGpsStatus("loading");
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGpsStatus("idle");
      },
      () => {
        setGpsStatus("error");
        showError("No pudimos obtener tu ubicación. Revisa el permiso de ubicación e inténtalo de nuevo.");
      },
      { enableHighAccuracy: true, timeout: 15000 },
    );
  };

  const onPickProof = (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showError("El comprobante debe ser una foto.");
      return;
    }
    if (proofPreview) URL.revokeObjectURL(proofPreview);
    setProofFile(file);
    setProofPreview(URL.createObjectURL(file));
    setError(null);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (sending) return;
    if (!name.trim()) return showError("Escribe tu nombre.");
    if (!PHONE_RE.test(phone)) return showError("Ingresa un celular válido de 9 dígitos (empieza con 9).");
    if (!reference.trim()) return showError("La referencia de tu dirección es obligatoria.");
    if (!paymentMethod) return showError("Elige cómo vas a pagar.");
    if (paymentMethod === "YAPE" && !proofFile)
      return showError("Sube la captura de tu Yape para continuar.");

    setSending(true);
    setError(null);
    try {
      const result = await createOrder(
        {
          customerName: name,
          phone,
          reference,
          lat: coords?.lat ?? null,
          lng: coords?.lng ?? null,
          paymentMethod: paymentMethod as "YAPE" | "CONTRA_ENTREGA",
          items,
        },
        paymentMethod === "YAPE" ? proofFile : null,
      );
      if (!result.ok) {
        showError(result.error);
        toast.error(result.error);
      } else {
        clear();
        saveProfile({ name, phone, reference });
        saveOrder({
          token: result.trackingToken,
          number: result.orderNumber,
          total,
          placedAt: new Date().toISOString(),
        });
        setOrder({ token: result.trackingToken, number: result.orderNumber });
        window.scrollTo({ top: 0 });
      }
    } catch {
      showError("⚠️ No pudimos completar el pedido. Comprueba tu conexión e inténtalo nuevamente.");
    } finally {
      setSending(false);
    }
  };

  // ---------- UI: formulario único ----------
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 p-4 pb-8">
      <header>
        <Link href="/carrito" className="text-sm text-muted-foreground">
          ← Volver al carrito
        </Link>
        <h1 className="text-xl font-bold">Completa tu pedido</h1>
      </header>

      {error && (
        <div
          ref={errorRef}
          role="alert"
          className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      <form onSubmit={submit} className="flex flex-col gap-5">
        {/* Datos */}
        <section className="flex flex-col gap-3" aria-label="Tus datos">
          <h2 className="font-semibold">👤 Tus datos</h2>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="text-sm font-medium">Tu nombre</label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: María Pérez"
              autoComplete="name"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="phone" className="text-sm font-medium">Tu celular</label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 9))}
              placeholder="Ej: 912345678"
              inputMode="numeric"
              autoComplete="tel"
            />
            <p className="text-xs text-muted-foreground">9 dígitos, empieza con 9. Sin cuenta ni contraseña.</p>
          </div>
        </section>

        {/* Ubicación */}
        <section className="flex flex-col gap-3" aria-label="¿Dónde te lo llevamos?">
          <h2 className="font-semibold">📍 ¿Dónde te lo llevamos?</h2>
          {!coords ? (
            <Button
              type="button"
              size="lg"
              variant="secondary"
              onClick={requestLocation}
              disabled={gpsStatus === "loading"}
            >
              {gpsStatus === "loading" ? "Obteniendo ubicación…" : "📍 USAR MI UBICACIÓN"}
            </Button>
          ) : (
            <div className="flex flex-col gap-2">
              <LocationMap lat={coords.lat} lng={coords.lng} />
              <p className="text-xs text-muted-foreground">
                ✅ Ubicación lista. Solo la usamos para llevarte el pedido.
              </p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => { setCoords(null); requestLocation(); }}
              >
                Actualizar ubicación
              </Button>
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="reference" className="text-sm font-medium">
              Dirección y referencia <span className="text-destructive">*</span>
            </label>
            <textarea
              id="reference"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              rows={3}
              placeholder="Ej: Av. Los Olivos 123, casa azul con puerta negra, frente al parque"
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </div>
        </section>

        {/* Pago */}
        <section className="flex flex-col gap-3" aria-label="¿Cómo pagas?">
          <h2 className="font-semibold">💳 ¿Cómo pagas?</h2>
          <div className="grid gap-2">
            <button
              type="button"
              onClick={() => setPaymentMethod("YAPE")}
              aria-pressed={paymentMethod === "YAPE"}
              className={`rounded-lg border-2 p-4 text-left font-medium ${
                paymentMethod === "YAPE" ? "border-primary bg-primary/5" : "border-muted"
              }`}
            >
              💜 PAGAR CON YAPE
              <span className="block text-sm font-normal text-muted-foreground">
                Transfiere ahora y sube la captura.
              </span>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod("CONTRA_ENTREGA")}
              aria-pressed={paymentMethod === "CONTRA_ENTREGA"}
              className={`rounded-lg border-2 p-4 text-left font-medium ${
                paymentMethod === "CONTRA_ENTREGA" ? "border-primary bg-primary/5" : "border-muted"
              }`}
            >
              💵 PAGAR AL RECIBIR
              <span className="block text-sm font-normal text-muted-foreground">
                Paga en efectivo cuando llegue tu pedido.
              </span>
            </button>
          </div>

          {paymentMethod === "YAPE" && (
            <Card>
              <CardContent className="flex flex-col gap-3 p-4">
                <p className="text-sm">
                  Yapea <strong>{formatSoles(total)}</strong> a{" "}
                  <strong>{settings?.yape_holder ?? "Blux"}</strong>
                </p>
                <p className="text-xl font-bold tracking-wide">
                  {settings?.yape_number ?? "Número aún no configurado"}
                </p>
                {settings?.qr_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={settings.qr_url} alt="QR de Yape" className="mx-auto w-40 rounded-md" />
                )}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="proof" className="text-sm font-medium">
                    Sube la captura de tu pago <span className="text-destructive">*</span>
                  </label>
                  <input
                    ref={fileInputRef}
                    id="proof"
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="rounded-md border border-dashed p-3 text-sm"
                    onChange={(e) => onPickProof(e.target.files?.[0] ?? null)}
                  />
                  {proofPreview && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={proofPreview} alt="Comprobante de pago" className="mx-auto w-40 rounded-md" />
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Resumen */}
        <section className="flex flex-col gap-3" aria-label="Resumen">
          <h2 className="font-semibold">🧾 Resumen</h2>
          <div className="rounded-lg border p-4 text-sm">
            {items.map((i) => (
              <div key={i.productId} className="flex justify-between py-0.5">
                <span>{i.quantity} × {i.name}</span>
                <span>{formatSoles(i.price * i.quantity)}</span>
              </div>
            ))}
            <div className="mt-2 flex justify-between border-t pt-2 text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatSoles(subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Delivery</span>
              <span>{formatSoles(deliveryFee)}</span>
            </div>
            <div className="flex justify-between pt-2 text-base font-bold">
              <span>Total</span>
              <span className="text-blux-600">{formatSoles(total)}</span>
            </div>
          </div>
        </section>

        <Button type="submit" size="lg" className="h-14 w-full text-base font-bold" disabled={sending}>
          {sending ? "Enviando…" : "CONFIRMAR PEDIDO"}
        </Button>
      </form>
    </main>
  );
}
