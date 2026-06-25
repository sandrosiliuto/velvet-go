"use client";

import { useEffect, useState } from "react";
import { Marker, Circle, Popup } from "react-leaflet";
import L from "leaflet";
import { Gift, MapPin } from "lucide-react";
import { renderToString } from "react-dom/server";

type Checkpoint = {
  id: string;
  name: string;
  type: "location" | "qr" | "challenge";
  lat: number;
  lng: number;
  radius_meters: number;
  reward_id?: string | null;
  reward?: { title?: string } | null;
  distance_meters?: number;
  challenge?: string | null;
  is_active?: boolean;
};

function createIcon(type: Checkpoint["type"], isRewarded: boolean) {
  const color = isRewarded ? "#B76E79" : "#F4EADE";
  const IconSvg = isRewarded ? Gift : MapPin;
  const svg = renderToString(
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="36"
      height="36"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" fill="#0A0A0A" stroke={color} />
      <foreignObject x="6" y="6" width="12" height="12">
        {<IconSvg width={12} height={12} color={color} />
        }
      </foreignObject>
    </svg>
  );
  return L.divIcon({
    className: "custom-marker",
    html: svg,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
}

export function CheckpointMarker({
  checkpoint,
  onSelect,
}: {
  checkpoint: Checkpoint;
  onSelect?: (checkpoint: Checkpoint) => void;
}) {
  const isRewarded = !!checkpoint.reward_id;
  const [icon, setIcon] = useState<L.DivIcon | null>(null);

  useEffect(() => {
    setIcon(createIcon(checkpoint.type, isRewarded));
  }, [checkpoint.type, isRewarded]);

  if (!icon) return null;

  const distanceText =
    checkpoint.distance_meters != null
      ? checkpoint.distance_meters < 1000
        ? `${Math.round(checkpoint.distance_meters)} m`
        : `${(checkpoint.distance_meters / 1000).toFixed(1)} km`
      : null;

  return (
    <>
      <Circle
        center={[checkpoint.lat, checkpoint.lng]}
        radius={checkpoint.radius_meters}
        pathOptions={{
          color: "#B76E79",
          fillColor: "#B76E79",
          fillOpacity: 0.12,
          weight: 1,
        }}
      />
      <Marker
        position={[checkpoint.lat, checkpoint.lng]}
        icon={icon}
        eventHandlers={{
          click: () => onSelect?.(checkpoint),
        }}
      >
        <Popup className="velvet-popup">
          <div className="min-w-[180px] p-1">
            <h4 className="font-[family-name:var(--font-cinzel)] text-sm text-[#F4EADE] mb-1">
              {checkpoint.name}
            </h4>
            {checkpoint.reward?.title && (
              <p className="text-xs text-[#B76E79] mb-2">
                {checkpoint.reward.title}
              </p>
            )}
            {distanceText && (
              <p className="text-[10px] uppercase tracking-wider text-[#F2D7D3]/60 mb-2">
                A {distanceText}
              </p>
            )}
            {checkpoint.challenge && (
              <p className="text-xs text-[#F2D7D3]/80 mb-3 italic">
                “{checkpoint.challenge}”
              </p>
            )}
            <button
              onClick={() => onSelect?.(checkpoint)}
              className="w-full py-2 rounded-lg bg-[#B76E79] hover:bg-[#a05d68] text-white text-xs font-semibold uppercase tracking-wider"
            >
              {isRewarded ? "Ver recompensa" : "Ver detalle"}
            </button>
          </div>
        </Popup>
      </Marker>
    </>
  );
}
