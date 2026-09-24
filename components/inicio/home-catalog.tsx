"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Star, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { formatSoles } from "@/lib/business";
import { PromoReel } from "./promo-reel";
import type { Category, Product, Promotion } from "@/types";

/** Ícono por categoría según el mockup (fallback 🍽️). */
function categoryIcon(cat: Category): string {
  const n = cat.name.toLowerCase();
  if (n.includes("caldo")) return "🥣";
  if (n.includes("mostrito")) return "🍟";
  if (n.includes("broaster") || n.includes("pollo")) return "🍗";
  if (n.includes("choclo")) return "🌽";
  if (n.includes("postre") || n.includes("picaron")) return "🍩";
  if (n.includes("bebida") || n.includes("chicha") || n.includes("jugo")) return "🥤";
  return "🍽️";
}

/** Fallback local para platos sin foto en la BD (mismo criterio que la carta). */
function fallbackImage(name: string): string | null {
  const n = name.toLowerCase();
  if (n.includes("caldo")) return "/dishes/caldo-de-gallina.jpg";
  if (n.includes("mostrito")) return "/dishes/mostrito-broaster.jpg";
  if (n.includes("broaster") || n.includes("pollo")) return "/dishes/pollo-broaster.jpg";
  if (n.includes("picarone")) return "/dishes/picarones.jpg";
  return null;
}

function ProductImage({ name, imageUrl }: { name: string; imageUrl: string | null }) {
  imageUrl ??= fallbackImage(name);
  if (imageUrl) {
    return (
      <Image
        src={imageUrl}
        alt={name}
        fill
        sizes="(max-width: 640px) 50vw, 200px"
        className="object-cover"
      />
    );
  }
  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-500/10 via-red-500/5 to-transparent">
      <span className="text-3xl" aria-hidden>🍽️</span>
    </div>
  );
}

export function HomeCatalog({
  categories,
  products,
  featured,
  promotions,
  closed,
}: {
  categories: Category[];
  products: Product[];
  featured: Product | null;
  promotions: Promotion[];
  closed: boolean;
}) {
  const [query, setQuery] = useState("");
  // Por defecto se muestran TODOS los platos (antes quedaba filtrado a la
  // primera categoría y parecía que solo había 2 productos).
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const addItem = useCart((s) => s.addItem);

  const searching = query.trim().length > 0;

  const filtered = useMemo(() => {
    let list = products;
    if (activeSlug && !searching) {
      const cat = categories.find((c) => c.slug === activeSlug);
      if (cat) list = list.filter((p) => p.category_id === cat.id);
    }
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description ?? "").toLowerCase().includes(q),
      );
    }
    return list;
  }, [products, categories, activeSlug, query, searching]);

  const add = (p: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (closed) return;
    addItem({ productId: p.id, name: p.name, price: Number(p.price), imageUrl: p.image_url ?? fallbackImage(p.name) });
    toast.success(`${p.name} agregado al carrito`);
  };

  return (
    <div className="flex flex-col gap-5 pb-6">
      {/* Buscador */}
      <div className="px-4 pt-3">
        <label className="flex items-center gap-2 rounded-full border border-black/5 bg-white px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-[#f04e1e]/40">
          <Search className="size-5 shrink-0 text-stone-400" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="¿Qué quieres pedir hoy?"
            className="w-full bg-transparent text-sm text-stone-800 outline-none placeholder:text-stone-400"
          />
        </label>
      </div>

      {/* Chips de categorías con ícono */}
      <div
        className="flex gap-2 overflow-x-auto px-4 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="tablist"
        aria-label="Categorías"
      >
        <button
          role="tab"
          aria-selected={activeSlug === null && !searching}
          onClick={() => setActiveSlug(null)}
          className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold transition-all ${
            activeSlug === null && !searching
              ? "bg-[#f04e1e] text-white shadow-md shadow-[#f04e1e]/30"
              : "bg-white text-stone-600 border border-black/5 hover:text-stone-900"
          }`}
        >
          <span aria-hidden>🍴</span>
          Todos
        </button>
        {categories.map((c) => {
          const active = activeSlug === c.slug && !searching;
          return (
            <button
              key={c.id}
              role="tab"
              aria-selected={active}
              onClick={() => setActiveSlug(active ? null : c.slug)}
              className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold transition-all ${
                active
                  ? "bg-[#f04e1e] text-white shadow-md shadow-[#f04e1e]/30"
                  : "bg-white text-stone-600 border border-black/5 hover:text-stone-900"
              }`}
            >
              <span aria-hidden>{categoryIcon(c)}</span>
              {c.name}
            </button>
          );
        })}
      </div>

      {/* Reel de promociones: solo imagen, avanza solo cada 5 s.
          Reemplaza al plato destacado cuando hay promos activas. */}
      {!searching && promotions.length > 0 && <PromoReel promotions={promotions} />}

      {/* Plato destacado (fallback cuando no hay promociones) */}
      {promotions.length === 0 && featured && !searching && (
        <section className="px-4" aria-label="Plato destacado">
          <div className="relative aspect-[4/3.4] overflow-hidden rounded-3xl shadow-lg">
            {featured.image_url || fallbackImage(featured.name) ? (
              <Image
                src={featured.image_url || fallbackImage(featured.name)!}
                alt={featured.name}
                fill
                priority
                sizes="(max-width: 640px) 100vw, 420px"
                className="object-cover"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-amber-600/40 to-[#141924]" />
            )}
            {/* Gradiente de legibilidad */}
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/10"
            />
            <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-blux-gold-500 px-2.5 py-1 text-[11px] font-extrabold text-[#3a2704] shadow-md">
              <Star className="size-3 fill-current" aria-hidden /> Plato destacado
            </span>

            <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-4">
              <h2 className="font-display text-2xl font-black tracking-tight text-white drop-shadow">
                {featured.name}
              </h2>
              {featured.description && (
                <p className="line-clamp-2 max-w-[90%] text-xs leading-relaxed text-stone-200">
                  {featured.description}
                </p>
              )}
              <div className="mt-1 flex flex-col gap-2.5">
                <span className="font-display text-xl font-extrabold text-white">
                  {formatSoles(Number(featured.price))}
                </span>
                <Button
                  onClick={(e) => add(featured, e)}
                  disabled={closed}
                  className="h-11 w-full rounded-xl bg-[#f04e1e] text-xs font-extrabold uppercase tracking-wider text-white shadow-lg shadow-[#f04e1e]/40 hover:bg-[#d8431a] active:scale-95"
                >
                  <ShoppingCart className="size-4 mr-1.5" aria-hidden />
                  Agregar al carrito
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Nuestros platos */}
      <section className="flex flex-col gap-3 px-4" aria-label="Nuestros platos">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-bold tracking-tight text-stone-900">
            Nuestros platos
          </h2>
          <Link
            href="/carta"
            className="text-xs font-bold text-[#f04e1e] hover:underline inline-flex items-center gap-0.5"
          >
            Ver toda la carta <span aria-hidden>›</span>
          </Link>
        </div>

        {filtered.length === 0 ? (
          <p className="py-10 text-center text-sm text-stone-500">
            No encontramos nada con esa búsqueda 😅
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((p) => (
              <div
                key={p.id}
                className="flex flex-col rounded-[1.35rem] border border-black/5 bg-white p-1.5 shadow-sm"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[1.05rem] bg-stone-100">
                  <ProductImage name={p.name} imageUrl={p.image_url} />
                </div>
                <div className="flex flex-1 flex-col gap-0.5 px-2 pt-2 pb-2">
                  <h3 className="text-[13px] font-bold leading-snug text-stone-900">{p.name}</h3>
                  {p.description && (
                    <p className="line-clamp-2 text-[11px] leading-snug text-stone-500">
                      {p.description}
                    </p>
                  )}
                  <div className="mt-auto flex flex-col gap-1.5 pt-2">
                    <span className="text-sm font-extrabold text-stone-900">
                      {formatSoles(Number(p.price))}
                    </span>
                    <Button
                      size="sm"
                      onClick={(e) => add(p, e)}
                      disabled={closed}
                      className="h-8 w-full rounded-xl bg-[#f04e1e] px-2 text-[10px] font-extrabold uppercase tracking-wide text-white shadow-sm hover:bg-[#d8431a] active:scale-95"
                    >
                      <ShoppingCart className="size-3 mr-1" aria-hidden />
                      Agregar
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
