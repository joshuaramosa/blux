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

/** El repartidor emite su GPS mientras está EN_CAMINO (tracking en vivo del cliente).
 *  RLS: solo puede actualizar su propia asignación. */
export async function updateDriverLocation(
  assignmentId: string,
  lat: number,
  lng: number,
) {
  const auth = await requireDeliveryStaff();
  if (auth.error) return auth;

  // Coordenadas plausibles (evita datos corruptos del GPS)
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return { error: "Coordenadas inválidas" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("delivery_assignments")
    .update({
      last_lat: lat,
      last_lng: lng,
      location_updated_at: new Date().toISOString(),
    })
    .eq("id", assignmentId)
    .eq("delivery_user_id", auth.userId!)
    .eq("status", "EN_CAMINO");
  if (error) return { error: error.message };
  return { success: true };
}

/** Deja de compartir ubicación de una asignación (privacidad post-entrega). */
export async function clearDriverLocation(assignmentId: string) {
  const auth = await requireDeliveryStaff();
  if (auth.error) return auth;

  const supabase = await createClient();
  const { error } = await supabase
    .from("delivery_assignments")
    .update({ last_lat: null, last_lng: null, location_updated_at: null })
    .eq("id", assignmentId)
    .eq("delivery_user_id", auth.userId!);
  if (error) return { error: error.message };
  return { success: true };
}

/** EN_CAMINO → ENTREGADO */
export async function markDelivered(assignmentId: string, orderId: string) {
  const auth = await requireDeliveryStaff();
  if (auth.error) return auth;

  const supabase = await createClient();
  const now = new Date().toISOString();

  // Se limpia la posición: el cliente deja de ver al motorizado al entregar
  const { error: aErr } = await supabase
    .from("delivery_assignments")
    .update({
      status: "ENTREGADO",
      delivered_at: now,
      last_lat: null,
      last_lng: null,
      location_updated_at: null,
    })
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
