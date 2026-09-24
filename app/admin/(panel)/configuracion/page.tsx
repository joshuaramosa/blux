import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/guards";
import { SettingsForm } from "@/components/admin/settings-form";
import type { BusinessSettings } from "@/types";

export const metadata = { title: "Configuración — BLUX Admin" };

export default async function AdminConfiguracionPage() {
  const staff = await requireRole(["ADMIN"]);
  const supabase = await createClient();

  const { data: settingsData } = await supabase
    .from("business_settings")
    .select("*")
    .eq("id", 1)
    .single();

  const settings: BusinessSettings = settingsData || {
    id: 1,
    business_name: "BLUX Sabor de Casa",
    whatsapp: null,
    yape_number: null,
    yape_holder: null,
    delivery_fee: 0,
    open_time: "17:30",
    close_time: "22:00",
    is_open: true,
    logo_url: null,
    qr_url: null,
  };

  return (
    <main className="max-w-3xl mx-auto p-4 space-y-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Configuración del Negocio</h1>
        <p className="text-xs text-muted-foreground">
          Horarios de atención, costo de delivery, datos Yape y marca
        </p>
      </div>

      <SettingsForm
        initialSettings={settings}
        currentUserRole={staff.role}
      />
    </main>
  );
}
