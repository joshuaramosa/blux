import type { BusinessSettings } from "@/types";

/** Hora actual en Perú (America/Lima) en formato "HH:mm". */
export function nowInLima(): string {
  return new Intl.DateTimeFormat("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "America/Lima",
  }).format(new Date());
}

/** ¿Blux está atendiendo ahora? Soporta horarios que cruzan medianoche. */
export function isOpenNow(settings: BusinessSettings): boolean {
  if (!settings.is_open) return false;
  const now = nowInLima();
  const { open_time, close_time } = settings;
  if (open_time <= close_time) {
    return now >= open_time && now < close_time;
  }
  // cruza medianoche, ej. 17:30–02:00
  return now >= open_time || now < close_time;
}

export function formatSoles(amount: number): string {
  return `S/ ${amount.toFixed(2)}`;
}
