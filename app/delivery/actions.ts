"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function requireDeliveryStaff() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return { error: "No autorizado" as const, userId: null };

  const { data: staff } = await supabase
    .from("users")
    .select("role, is_active")
    .eq("id", data.user.id)
    .single();

  if (!staff || !staff.is_active || !["REPARTIDOR", "ADMIN"].includes(staff.role)) {
    return { error: "Solo el repartidor puede hacer esto.", userId: null };
  }
  return { error: null, userId: data.user.id };
}

/** ASIGNADO → EN_CAMINO: el repartidor sale con el pedido */
export async function startDelivery(assignmentId: string, orderId: string) {
  const auth = await requireDeliveryStaff();
  if (auth.error) return auth;

  const supabase = await createClient();
  const now = new Date().toISOString();

  const { error: aErr } = await supabase
    .from("delivery_assignments")
    .update({ status: "EN_CAMINO", picked_up_at: now })
    .eq("id", assignmentId)
    .eq("status", "ASIGNADO");
  if (aErr) return { error: aErr.message };

  const { error: oErr } = await supabase
    .from("orders")
    .update({ status: "EN_CAMINO", updated_at: now })
    .eq("id", orderId)
    .eq("status", "ASIGNADO");
  if (oErr) return { error: oErr.message };

  revalidatePath("/delivery");
  revalidatePath("/admin/pedidos");
  return { success: true };
}

/** EN_CAMINO → ENTREGADO */
export async function markDelivered(assignmentId: string, orderId: string) {
  const auth = await requireDeliveryStaff();
  if (auth.error) return auth;

  const supabase = await createClient();
  const now = new Date().toISOString();

  const { error: aErr } = await supabase
    .from("delivery_assignments")
    .update({ status: "ENTREGADO", delivered_at: now })
    .eq("id", assignmentId)
    .eq("status", "EN_CAMINO");
  if (aErr) return { error: aErr.message };

  const { error: oErr } = await supabase
    .from("orders")
    .update({ status: "ENTREGADO", updated_at: now })
    .eq("id", orderId)
    .eq("status", "EN_CAMINO");
  if (oErr) return { error: oErr.message };

  revalidatePath("/delivery");
  revalidatePath("/admin/pedidos");
  revalidatePath("/admin/ventas");
  return { success: true };
}
