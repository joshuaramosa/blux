"use client";

import Image from "next/image";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatSoles } from "@/lib/business";
import { useCart } from "@/hooks/use-cart";
import { BluxLogo } from "@/components/ui/blux-logo";
import type { Product } from "@/types";

function getProductImage(product: Product): string | null {
  if (product.image_url) return product.image_url;
  const name = product.name.toLowerCase();
  if (name.includes("caldo")) return "/dishes/caldo-de-gallina.jpg";
  if (name.includes("mostrito")) return "/dishes/mostrito-broaster.jpg";
  if (name.includes("broaster") || name.includes("pollo")) return "/dishes/pollo-broaster.jpg";
  if (name.includes("picarone")) return "/dishes/picarones.jpg";
  return null;
}

export function ProductCard({
  product,
  closed,
}: {
  product: Product;
  closed: boolean;
}) {
  const addItem = useCart((s) => s.addItem);
  const disabled = !product.is_available || closed;
  const displayImage = getProductImage(product);

  const handleAdd = () => {
    if (!product.is_available) return;
    addItem({
      productId: product.id,
      name: product.name,
      price: Number(product.price),
      imageUrl: displayImage,
    });
    toast.success(`${product.name} agregado al carrito`);
  };

  return (
    <Card className="overflow-hidden border border-border/80 bg-card rounded-2xl shadow-xs transition-all duration-300 hover:border-blux-gold-500/50 hover:shadow-md flex flex-col justify-between">
      {/* Fotografía grande y atractiva del plato */}
      <div className="relative aspect-[16/11] w-full overflow-hidden bg-muted/40">
        {displayImage ? (
          <Image
            src={displayImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px"
            className="object-cover transition-transform duration-500 hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-amber-500/10 via-red-500/5 to-transparent p-3">
            <BluxLogo size="xs" priority={false} />
            <span className="mt-1 font-sans text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              EL BLUX
            </span>
          </div>
        )}

        {!product.is_available && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-xs">
            <Badge variant="destructive" className="font-sans font-bold text-xs uppercase tracking-wider px-3 py-1">
              Agotado por hoy
            </Badge>
          </div>
        )}
      </div>

      {/* Contenido tipográfico con jerarquía estricta */}
      <CardContent className="flex flex-1 flex-col justify-between p-4 gap-3">
        <div className="space-y-1">
          {/* NOMBRE DEL PLATO: Sans-serif semibold/bold */}
          <h4 className="font-sans font-bold text-base sm:text-lg text-foreground leading-snug tracking-tight">
            {product.name}
          </h4>

          {/* DESCRIPCIÓN: Sans-serif regular */}
          {product.description && (
            <p className="font-sans font-normal text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-2">
              {product.description}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/40">
          {/* PRECIO: Sans-serif bold, grande y destacado */}
          <div className="flex flex-col">
            <span className="font-sans text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
              Precio
            </span>
            <span className="font-sans font-extrabold text-lg sm:text-xl text-blux-600 dark:text-blux-500 tracking-tight">
              {formatSoles(Number(product.price))}
            </span>
          </div>

          {/* BOTÓN: Sans-serif bold, fácil de tocar en móvil (min 44px) */}
          <Button
            size="default"
            disabled={disabled}
            onClick={handleAdd}
            aria-disabled={disabled}
            className="font-sans font-bold text-xs sm:text-sm uppercase tracking-wider h-11 px-4 sm:px-5 rounded-xl bg-blux-600 hover:bg-blux-700 active:scale-95 text-white shadow-xs transition-all"
          >
            <Plus className="size-4 mr-1 stroke-[3]" />
            <span>{product.is_available ? "PEDIR AHORA" : "AGOTADO"}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
