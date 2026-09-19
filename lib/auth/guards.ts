import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { homeByRole, type UserRole } from "@/lib/auth/roles";

/**
 * Verificación de rol en el servidor (defensa en profundidad junto al proxy).
 * Redirige a /admin/login si no hay sesión, o al panel del rol si no corresponde.
 */
export async function requireRole(allowed: UserRole[]) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/admin/login");
  }

  const { data: staff } = await supabase
    .from("users")
    .select("id, role, is_active, full_name")
    .eq("id", data.user.id)
    .single();

  if (!staff || !staff.is_active || !allowed.includes(staff.role as UserRole)) {
    redirect(homeByRole(staff?.role as UserRole | null));
  }

  return staff as { id: string; role: UserRole; is_active: boolean; full_name: string };
}
