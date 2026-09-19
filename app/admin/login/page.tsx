import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { homeByRole, type UserRole } from "@/lib/auth/roles";
import { LoginForm } from "./login-form";

export const metadata = { title: "Iniciar sesión — BLUX" };

export default async function LoginPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (data.user) {
    const { data: staff } = await supabase
      .from("users")
      .select("role")
      .eq("id", data.user.id)
      .single();
    redirect(homeByRole(staff?.role as UserRole));
  }

  return (
    <main className="flex flex-1 min-h-screen items-center justify-center p-4 bg-gradient-to-b from-blux-50 to-background">
      <LoginForm />
    </main>
  );
}
