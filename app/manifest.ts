import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Blux Sabor de Casa",
    short_name: "BLUX",
    description: "Pide tu comida favorita: caldo de gallina, mostritos, broaster y más.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#E4572E",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
