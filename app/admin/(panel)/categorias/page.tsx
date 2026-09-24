import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/guards";
import { CategoriesView } from "@/components/admin/categories-view";
import type { Category } from "@/types";

export const metadata = { title: "Categorías — BLUX Admin" };

export default async function AdminCategoriasPage() {
  await requireRole(["ADMIN"]);
  const supabase = await createClient();

  const { data } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  const categories: Category[] = data || [];

  return (
    <main className="max-w-3xl mx-auto p-4 space-y-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Categorías</h1>
        <p className="text-xs text-muted-foreground">
          Organiza el orden de las secciones en la carta digital
        </p>
      </div>

      <CategoriesView categories={categories} />
    </main>
  );
}
