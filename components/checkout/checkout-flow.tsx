"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { useCart, useCartSubtotal } from "@/hooks/use-cart";
import { useMounted } from "@/hooks/use-mounted";
import { createOrder } from "@/app/checkout/actions";
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

type Step = "datos" | "ubicacion" | "pago" | "confirmar";
const STEPS: Step[] = ["datos", "ubicacion", "pago", "confirmar"];

export function CheckoutFlow({ settings }: { settings: BusinessSettings | null }) {
  const { items, clear } = useCart();
  const subtotal = useCartSubtotal();

  const mounted = useMounted();

  const [step, setStep] = useState<Step>("datos");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<{ token: string; number: number } | null>(null);

  // Paso 1: datos
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  // Paso 2: ubicación
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsStatus, setGpsStatus] = useState<"idle" | "loading" | "error">("idle");
  const [reference, setReference] = useState("");

  // Paso 3: pago
  const [paymentMethod, setPaymentMethod] = useState<"YAPE" | "CONTRA_ENTREGA" | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
          Tu pedido es el <span className="font-bold text-blux-600">#{String(order.number).padStart(3, "0")}</span>
        </p>
        <p className="text-sm text-muted-foreground">
          Te avisaremos cuando lo estemos preparando.
        </p>
        <Button asChild size="lg" className="w-full max-w-xs">
          <Link href={`/pedido/${order.token}`}>Ver estado de mi pedido</Link>
        </Button>
        <Button asChild variant="ghost">
          <Link href="/carta">Volver a la carta</Link>
        </Button>
      </main>
    );
  }

  // ---------- Handlers ----------
  const stepIndex = STEPS.indexOf(step);
  const goTo = (s: Step) => {
    setError(null);
    setStep(s);
    window.scrollTo({ top: 0 });
  };

  const nextFromDatos = () => {
    if (!name.trim()) return setError("Escribe tu nombre.");
    if (!PHONE_RE.test(phone)) return setError("Ingresa un celular válido de 9 dígitos (empieza con 9).");
    goTo("ubicacion");
  };

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setGpsStatus("error");
      setError("Tu navegador no soporta GPS. Escríbenos tu dirección en la referencia.");
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
        setError("No pudimos obtener tu ubicación. Revisa el permiso de ubicación e inténtalo de nuevo.");
      },
      { enableHighAccuracy: true, timeout: 15000 },
    );
  };

  const nextFromUbicacion = () => {
    if (!reference.trim()) return setError("La referencia de tu dirección es obligatoria.");
    goTo("pago");
  };

  const nextFromPago = () => {
    if (!paymentMethod) return setError("Elige cómo vas a pagar.");
    if (paymentMethod === "YAPE" && !proofFile)
      return setError("Sube la captura de tu Yape para continuar.");
    goTo("confirmar");
  };

  const onPickProof = (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("El comprobante debe ser una foto.");
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
        setError(result.error);
        toast.error(result.error);
      } else {
        clear();
        setOrder({ token: result.trackingToken, number: result.orderNumber });
        window.scrollTo({ top: 0 });
      }
    } catch {
      setError("⚠️ No pudimos completar el pedido. Comprueba tu conexión e inténtalo nuevamente.");
    } finally {
      setSending(false);
    }
  };

  // ---------- UI ----------
  const stepTitles: Record<Step, string> = {
    datos: "Tus datos",
    ubicacion: "¿Dónde te lo llevamos?",
    pago: "¿Cómo pagas?",
    confirmar: "Confirma tu pedido",
  };

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 p-4">
      {/* Progreso */}
      <div className="flex gap-1.5" aria-label={`Paso ${stepIndex + 1} de ${STEPS.length}`}>
        {STEPS.map((s, i) => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full ${i <= stepIndex ? "bg-primary" : "bg-muted"}`}
          />
        ))}
      </div>

      <header>
        <Link href="/carrito" className="text-sm text-muted-foreground">
          ← Volver al carrito
        </Link>
        <h1 className="text-xl font-bold">
          Paso {stepIndex + 1} de {STEPS.length}: {stepTitles[step]}
        </h1>
      </header>

      {error && (
        <div role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Paso 1: Datos */}
      {step === "datos" && (
        <div className="flex flex-col gap-4">
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
          <Button size="lg" onClick={nextFromDatos}>Continuar</Button>
        </div>
      )}

      {/* Paso 2: Ubicación */}
      {step === "ubicacion" && (
        <div className="flex flex-col gap-4">
          {!coords ? (
            <Button size="lg" variant="secondary" onClick={requestLocation} disabled={gpsStatus === "loading"}>
              {gpsStatus === "loading" ? "Obteniendo ubicación…" : "📍 USAR MI UBICACIÓN"}
            </Button>
          ) : (
            <div className="flex flex-col gap-2">
              <LocationMap lat={coords.lat} lng={coords.lng} />
              <p className="text-xs text-muted-foreground">
                ✅ Ubicación lista. Solo la usamos para llevarte el pedido.
              </p>
              <Button size="sm" variant="outline" onClick={() => { setCoords(null); requestLocation(); }}>
                Actualizar ubicación
              </Button>
            </div>
          )}
          {gpsStatus === "error" && (
            <p className="text-sm text-muted-foreground">
              Sin problema: describe tu dirección abajo para encontrarte.
            </p>
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
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => goTo("datos")}>Atrás</Button>
            <Button size="lg" className="flex-1" onClick={nextFromUbicacion}>Continuar</Button>
          </div>
        </div>
      )}

      {/* Paso 3: Pago */}
      {step === "pago" && (
        <div className="flex flex-col gap-4">
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

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => goTo("ubicacion")}>Atrás</Button>
            <Button size="lg" className="flex-1" onClick={nextFromPago}>Continuar</Button>
          </div>
        </div>
      )}

      {/* Paso 4: Confirmar */}
      {step === "confirmar" && (
        <form onSubmit={submit} className="flex flex-col gap-4">
          <Card>
            <CardContent className="flex flex-col gap-3 p-4 text-sm">
              <h2 className="font-semibold">🧾 Tu pedido</h2>
              {items.map((i) => (
                <div key={i.productId} className="flex justify-between">
                  <span>
                    {i.quantity} × {i.name}
                  </span>
                  <span>{formatSoles(i.price * i.quantity)}</span>
                </div>
              ))}
              <div className="flex justify-between border-t pt-2 text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatSoles(subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Delivery</span>
                <span>{formatSoles(deliveryFee)}</span>
              </div>
              <div className="flex justify-between text-base font-bold">
                <span>Total</span>
                <span className="text-blux-600">{formatSoles(total)}</span>
              </div>

              <div className="mt-2 border-t pt-3">
                <p className="font-semibold">🚚 Entrega</p>
                <p className="text-muted-foreground">{name} · {phone}</p>
                <p className="text-muted-foreground">{reference}</p>
                {coords && <p className="text-xs text-muted-foreground">📍 Ubicación GPS adjunta</p>}
              </div>

              <div className="border-t pt-3">
                <p className="font-semibold">💳 Pago</p>
                <p className="text-muted-foreground">
                  {paymentMethod === "YAPE" ? "Yape (comprobante adjunto)" : "Pago al recibir"}
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => goTo("pago")} disabled={sending}>
              Atrás
            </Button>
            <Button type="submit" size="lg" className="flex-1 text-base" disabled={sending}>
              {sending ? "Enviando…" : "CONFIRMAR PEDIDO"}
            </Button>
          </div>
        </form>
      )}
    </main>
  );
}
