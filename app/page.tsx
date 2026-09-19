import Link from "next/link";
import Image from "next/image";
import { Bike, Clock, Sparkles, ChevronRight, ShieldCheck } from "lucide-react";
import { BluxLogo } from "@/components/ui/blux-logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const FEATURED_DISHES = [
  {
    name: "Caldo de gallina criollo",
    description: "Con papa amarilla, fideo grueso, huevo cocido y porción de cancha serrana crocante.",
    price: "S/ 16.00",
    image: "/dishes/caldo-de-gallina.jpg",
    badge: "Plato estrella",
  },
  {
    name: "Mostrito broaster clásico",
    description: "1/8 de pollo broaster crocante servido sobre abundante arroz chaufa al wok y papas.",
    price: "S/ 15.00",
    image: "/dishes/mostrito-broaster.jpg",
    badge: "El más pedido",
  },
  {
    name: "Pollo broaster tradicional",
    description: "Cuarto de pollo tierno y crujiente, acompañado de papas doradas y cremas peruanas.",
    price: "S/ 14.00",
    image: "/dishes/pollo-broaster.jpg",
    badge: "Sabor casero",
  },
  {
    name: "Picarones en miel de chancaca",
    description: "Aros artesanales calientes de zapallo y camote con aromática miel de higo y chancaca.",
    price: "S/ 10.00",
    image: "/dishes/picarones.jpg",
    badge: "Postre tradicional",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-background font-sans selection:bg-blux-gold-500/30 selection:text-blux-900">
      {/* SECCIÓN HERO GASTRONÓMICA CON BRANDING RETRO-MODERNO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0b0e14] via-[#141924] to-[#1a120e] text-white pt-8 pb-16 px-4 border-b border-blux-gold-500/20">
        {/* Iluminación ambiental cálida */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/20 via-red-600/15 to-transparent"
        />

        {/* Barra superior de acceso rápido */}
        <div className="relative z-10 w-full max-w-5xl mx-auto flex items-center justify-between text-xs sm:text-sm mb-6">
          <span className="inline-flex items-center gap-2 font-sans font-medium text-stone-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            Atendiendo pedidos delivery & salón
          </span>
          <Link
            href="/admin/login"
            className="font-sans font-semibold text-stone-300 hover:text-white transition-colors hover:underline underline-offset-4"
          >
            Acceso Personal
          </Link>
        </div>

        {/* Contenido principal del Hero */}
        <div className="relative z-10 w-full max-w-3xl mx-auto flex flex-col items-center text-center">
          {/* Logo original intacto de EL BLUX */}
          <div className="mb-4">
            <BluxLogo size="hero" glow priority />
          </div>

          {/* H1: EL BLUX - Grande, pesado, serif display */}
          <h1 className="font-display font-black text-4xl sm:text-6xl md:text-7xl text-white tracking-tight drop-shadow-md">
            EL BLUX
          </h1>

          {/* FRASE DECORATIVA: Script elegante */}
          <span className="font-script text-3xl sm:text-4xl md:text-5xl text-blux-gold-400 select-none block -mt-1 sm:-mt-2 mb-2">
            Sabor de Casa
          </span>

          {/* H2: Serif display, elegante y llamativo */}
          <h2 className="font-display font-bold text-2xl sm:text-3xl md:text-4xl text-amber-100/95 max-w-xl mx-auto leading-tight mt-2 mb-4">
            Sabores que se sienten como en casa
          </h2>

          {/* DESCRIPCIÓN: Sans-serif regular, limpia y sencilla */}
          <p className="font-sans font-normal text-sm sm:text-base text-stone-300 max-w-lg mx-auto leading-relaxed mb-6">
            La tradición de la comida casera peruana llevada a tu mesa: caldos de gallina criollos, mostritos crujientes, pollo broaster dorado y postres tradicionales preparados al momento.
          </p>

          {/* Badges de confianza y delivery */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
            <Badge
              variant="secondary"
              className="font-sans font-semibold text-xs border border-blux-gold-500/30 bg-blux-gold-950/60 text-blux-gold-300 px-3 py-1 gap-1.5"
            >
              <Sparkles className="size-3.5 text-blux-gold-400" />
              Receta Tradicional
            </Badge>
            <Badge
              variant="secondary"
              className="font-sans font-semibold text-xs border border-red-500/30 bg-red-950/60 text-red-200 px-3 py-1 gap-1.5"
            >
              <Bike className="size-3.5 text-red-400" />
              Delivery en Moto
            </Badge>
            <Badge
              variant="secondary"
              className="font-sans font-semibold text-xs border border-stone-700 bg-stone-900/60 text-stone-300 px-3 py-1 gap-1.5"
            >
              <Clock className="size-3.5 text-blux-gold-400" />
              Atención Inmediata
            </Badge>
          </div>

          {/* BOTÓN: Sans-serif bold, PEDIR AHORA, fácil de tocar en móvil */}
          <div className="w-full max-w-xs sm:max-w-sm">
            <Button
              asChild
              size="lg"
              className="w-full font-sans font-bold text-sm sm:text-base tracking-wider uppercase h-14 px-8 rounded-2xl bg-blux-600 hover:bg-blux-700 text-white shadow-xl shadow-blux-600/30 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Link href="/carta">
                <span>PEDIR AHORA</span>
                <ChevronRight className="size-5 stroke-[2.5]" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* SECCIÓN DE PLATOS ESTRELLA */}
      <section className="w-full max-w-5xl mx-auto px-4 py-12 sm:py-16">
        <div className="text-center mb-10">
          {/* H3: Serif display, tamaño medio */}
          <h3 className="font-display font-bold text-3xl sm:text-4xl text-foreground tracking-tight">
            Nuestros platos
          </h3>
          {/* FRASE DECORATIVA: Script elegante */}
          <span className="font-script text-2xl sm:text-3xl text-blux-gold-600 dark:text-blux-gold-400 select-none block mt-1">
            Sabor de Casa
          </span>
          <p className="font-sans font-normal text-xs sm:text-sm text-muted-foreground max-w-md mx-auto mt-2">
            Disfruta de nuestros platos más representativos, preparados con ingredientes frescos y porciones generosas.
          </p>
        </div>

        {/* Tarjetas de productos limpias y mobile-first */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURED_DISHES.map((dish) => (
            <div
              key={dish.name}
              className="flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xs transition-all duration-300 hover:border-blux-gold-500/50 hover:shadow-md"
            >
              {/* Fotografía grande y apetitosa */}
              <div className="relative aspect-[16/11] w-full overflow-hidden bg-muted/40">
                <Image
                  src={dish.image}
                  alt={dish.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 280px"
                  className="object-cover transition-transform duration-500 hover:scale-105"
                />
                <div className="absolute top-3 left-3">
                  <Badge className="font-sans font-semibold text-[10px] uppercase tracking-wider bg-black/70 text-amber-300 backdrop-blur-xs border border-amber-400/30">
                    {dish.badge}
                  </Badge>
                </div>
              </div>

              {/* Contenido con jerarquía tipográfica */}
              <div className="flex flex-1 flex-col justify-between p-4 gap-3">
                <div className="space-y-1.5">
                  {/* NOMBRE DEL PLATO: Sans-serif semibold/bold */}
                  <h4 className="font-sans font-bold text-base text-foreground leading-snug tracking-tight">
                    {dish.name}
                  </h4>
                  {/* DESCRIPCIÓN: Sans-serif regular */}
                  <p className="font-sans font-normal text-xs text-muted-foreground leading-relaxed">
                    {dish.description}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-2 pt-3 border-t border-border/40">
                  {/* PRECIO: Sans-serif bold, grande y destacado */}
                  <div className="flex flex-col">
                    <span className="font-sans text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                      Precio
                    </span>
                    <span className="font-sans font-extrabold text-lg sm:text-xl text-blux-600 dark:text-blux-500 tracking-tight">
                      {dish.price}
                    </span>
                  </div>

                  {/* BOTÓN: Sans-serif bold, fácil de tocar en móvil */}
                  <Button
                    asChild
                    size="sm"
                    className="font-sans font-bold text-xs uppercase tracking-wider h-11 px-4 rounded-xl bg-blux-600 hover:bg-blux-700 active:scale-95 text-white shadow-xs transition-all"
                  >
                    <Link href="/carta">PEDIR AHORA</Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA para ver carta completa */}
        <div className="mt-12 text-center">
          <Button
            asChild
            variant="outline"
            size="lg"
            className="font-sans font-bold text-sm tracking-wider uppercase h-13 px-8 rounded-2xl border-2 border-blux-600 text-blux-600 hover:bg-blux-50 dark:hover:bg-blux-950/40"
          >
            <Link href="/carta" className="flex items-center gap-2">
              <span>Explorar Toda la Carta Digital</span>
              <ChevronRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* PIE DE PÁGINA TRADICIONAL & CONFIRMACIÓN */}
      <footer className="mt-auto border-t border-border bg-muted/20 py-8 px-4">
        <div className="w-full max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex flex-col items-center sm:items-start">
            <span className="font-display font-bold text-lg text-foreground">
              EL BLUX Restaurante
            </span>
            <span className="font-script text-xl text-blux-gold-600">
              Sabor de Casa
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="size-4 text-emerald-600" />
            <span className="font-sans">
              Tradición gastronómica peruana & entrega segura a domicilio
            </span>
          </div>

          <div className="text-xs text-muted-foreground font-sans">
            © {new Date().getFullYear()} EL BLUX. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </main>
  );
}
