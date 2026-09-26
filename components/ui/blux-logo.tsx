import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface BluxLogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "hero";
  glow?: boolean;
  priority?: boolean;
  className?: string;
  asLink?: boolean;
  href?: string;
  logoUrl?: string;
}

const SIZES = {
  xs: "w-20 h-auto",
  sm: "w-28 sm:w-32 h-auto",
  md: "w-40 sm:w-48 h-auto",
  lg: "w-56 sm:w-64 h-auto",
  xl: "w-72 sm:w-80 h-auto",
  hero: "w-full max-w-[320px] sm:max-w-[420px] h-auto",
};

export function BluxLogo({
  size = "md",
  glow = false,
  priority = true,
  className,
  asLink = false,
  href = "/",
  logoUrl,
}: BluxLogoProps) {
  const content = (
    <div
      className={cn(
        "relative inline-flex items-center justify-center transition-all duration-300 select-none",
        glow &&
          "drop-shadow-[0_4px_24px_rgba(245,158,11,0.28)] hover:drop-shadow-[0_8px_32px_rgba(220,38,38,0.38)]",
        className
      )}
    >
      <Image
        src={logoUrl || "/logo.png"}
        alt="EL BLUX Restaurante & Delivery — Sabor de Casa"
        width={1828}
        height={860}
        priority={priority}
        className="object-contain transition-transform duration-300"
        draggable={false}
      />
    </div>
  );

  if (asLink) {
    return (
      <Link
        href={href}
        className="inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blux-500 rounded-lg"
        aria-label="Ir al inicio de EL BLUX"
      >
        {content}
      </Link>
    );
  }

  return content;
}