"use client";

import { useEffect, useState } from "react";
import { Download, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useMounted } from "@/hooks/use-mounted";

// Evento no tipado en TS estándar (Chrome/Android)
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

/** Botón "Instalar app en tu teléfono": usa el prompt nativo en Android/Chrome
 *  y muestra instrucciones en iOS/Safari (instalación vía Compartir). */
export function InstallAppButton() {
  const mounted = useMounted();
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    // Estado derivado del entorno del navegador: se marca una vez al montar.
    if (standalone) setTimeout(() => setIsStandalone(true), 0);

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setPromptEvent(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  if (!mounted || isStandalone) return null;

  const onInstall = async () => {
    if (promptEvent) {
      await promptEvent.prompt();
      const { outcome } = await promptEvent.userChoice;
      if (outcome === "accepted") setPromptEvent(null);
      return;
    }
    // iOS (Safari) no expone beforeinstallprompt: mostrar instrucciones
    toast.info("En iPhone: toca Compartir (⎋) y luego “Añadir a pantalla de inicio”.", {
      duration: 6000,
    });
  };

  return (
    <Button variant="outline" onClick={onInstall} className="w-full gap-2">
      {promptEvent ? (
        <Download className="size-4" aria-hidden />
      ) : (
        <Share className="size-4" aria-hidden />
      )}
      Instalar la app en tu teléfono
    </Button>
  );
}
