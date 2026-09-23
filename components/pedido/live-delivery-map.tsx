"use client";

import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";

function emojiIcon(emoji: string, bg: string) {
  return L.divIcon({
    html: `<div style="display:flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:9999px;background:${bg};border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,.35);font-size:19px">${emoji}</div>`,
    className: "",
    iconSize: [38, 38],
    iconAnchor: [19, 19],
  });
}

const driverIcon = emojiIcon("🛵", "#f04e1e");
const destIcon = emojiIcon("🏠", "#16a34a");

/** Encuadra el mapa para ver motorizado y destino a la vez (suave). */
function FitBoth({
  driver,
  dest,
}: {
  driver: [number, number];
  dest: [number, number] | null;
}) {
  const map = useMap();
  useEffect(() => {
    if (dest) {
      map.fitBounds(L.latLngBounds([driver, dest]).pad(0.3), { animate: true });
    } else {
      map.setView(driver, map.getZoom(), { animate: true });
    }
  }, [driver[0], driver[1], dest?.[0], dest?.[1], map]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

export default function LiveDeliveryMap({
  driverLat,
  driverLng,
  destLat,
  destLng,
}: {
  driverLat: number;
  driverLng: number;
  destLat: number | null;
  destLng: number | null;
}) {
  const driver: [number, number] = [driverLat, driverLng];
  const dest: [number, number] | null =
    destLat != null && destLng != null ? [destLat, destLng] : null;

  return (
    <MapContainer
      center={driver}
      zoom={16}
      scrollWheelZoom={false}
      className="h-64 w-full rounded-lg"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={driver} icon={driverIcon} />
      {dest && <Marker position={dest} icon={destIcon} />}
      <FitBoth driver={driver} dest={dest} />
    </MapContainer>
  );
}
