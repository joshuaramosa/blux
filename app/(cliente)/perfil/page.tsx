"use client";

import { useState } from "react";
import Link from "next/link";
import { CircleUserRound, KeyRound, MapPin, Phone, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  clearProfile,
  getProfile,
  saveProfile,
  type CustomerProfile,
} from "@/lib/customer-profile";
import { useMounted } from "@/hooks/use-mounted";

const PHONE_RE = /^9\d{8}$/;

export default function PerfilPage() {
  const mounted = useMounted();
  // Inicialización perezosa: localStorage solo existe en el navegador.
  const [profile, setProfile] = useState<CustomerProfile>(() => {
    if (typeof window === "undefined") return { name: "", phone: "", reference: "" };
    return getProfile() ?? { name: "", phone: "", reference: "" };
  });

  const set = (key: keyof CustomerProfile) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setProfile((p) => ({ ...p, [key]: e.target.value }));

  const onSave = () => {
    if (!profile.name.trim()) return toast.error("Escribe tu nombre.");
    if (!PHONE_RE.test(profile.phone)) {
      return toast.error("Ingresa un celular válido de 9 dígitos (empieza con 9).");
    }
    saveProfile({
      name: profile.name.trim(),
      phone: profile.phone.trim(),
      reference: profile.reference.trim(),
    });
    toast.success("Perfil guardado en este teléfono");
  };

  const onClear = () => {
    clearProfile();
    setProfile({ name: "", phone: "", reference: "" });
    toast.success("Datos borrados de este teléfono");
  };

  if (!mounted) return null;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-5 p-4 pb-8">
      <header className="flex items-center gap-3 pt-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blux-600/10">
          <CircleUserRound className="size-7 text-blux-600" aria-hidden />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Tu perfil</h1>
          <p className="text-xs text-muted-foreground">
            Sin contraseñas: tus datos viven solo en este teléfono.
          </p>
        </div>
      </header>

      <section className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="p-name">Tu nombre</Label>
          <Input id="p-name" placeholder="Ej. Rosa Gutiérrez" value={profile.name} onChange={set("name")} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="p-phone" className="flex items-center gap-1.5">
            <Phone className="size-3.5" aria-hidden /> Celular
          </Label>
          <Input
            id="p-phone"
            inputMode="numeric"
            placeholder="9 dígitos, ej. 987654321"
            value={profile.phone}
            onChange={set("phone")}
            maxLength={9}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="p-ref" className="flex items-center gap-1.5">
            <MapPin className="size-3.5" aria-hidden /> Referencia de entrega
          </Label>
          <Input
            id="p-ref"
            placeholder="Ej. Casa azul con puerta negra, frente al parque"
            value={profile.reference}
            onChange={set("reference")}
          />
        </div>

        <Button
          onClick={onSave}
          className="mt-1 h-11 rounded-xl bg-blux-600 font-bold text-white hover:bg-blux-700 active:scale-95"
        >
          <Save className="size-4 mr-1.5" aria-hidden /> Guardar
        </Button>
      </section>

      <section className="flex flex-col gap-2">
        <Button asChild variant="outline" className="w-full">
          <Link href="/mis-pedidos">Ver mis pedidos anteriores</Link>
        </Button>
        <Button
          variant="ghost"
          onClick={onClear}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="size-4 mr-1.5" aria-hidden /> Borrar mis datos de este teléfono
        </Button>
      </section>

      {/* Acceso discreto al panel del personal (admin, cocina, delivery) */}
      <div className="mt-2 border-t border-border/60 pt-3 text-center">
        <Link
          href="/admin/login"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <KeyRound className="size-3.5" aria-hidden />
          Acceso personal
        </Link>
      </div>
    </main>
  );
}
