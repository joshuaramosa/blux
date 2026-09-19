"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { homeByRole, type UserRole } from "@/lib/auth/roles";

export async function login(prevState: { error: string } | null, formData: FormData) {
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Ingresa tu correo y contraseña." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "Correo o contraseña incorrectos." };
  }

  const { data: staff } = await supabase
    .from("users")
    .select("role, is_active")
    .eq("id", (await supabase.auth.getUser()).data.user?.id ?? "")
    .single();

  if (!staff || !staff.is_active) {
    await supabase.auth.signOut();
    return { error: "Tu cuenta no tiene acceso al panel." };
  }

  redirect(homeByRole(staff.role as UserRole));
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
