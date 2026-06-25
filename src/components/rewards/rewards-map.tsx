"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, useMap, ZoomControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { CheckpointMarker } from "./checkpoint-marker";

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

function MapUpdater({
  center,
}: {
  center: [number, number];
}) {
  const map = useMap();
  useEffect(() => {
    if (center[0] !== 0 && center[1] !== 0) {
      map.setView(center, 15, { animate: true });
    }
  }, [center, map]);
  return null;
}

export function RewardsMap({
  userLocation,
  checkpoints,
  onCheckpointSelect,
}: {
  userLocation: [number, number];
  checkpoints: Checkpoint[];
  onCheckpointSelect?: (checkpoint: Checkpoint) => void;
}) {
  return (
    <MapContainer
      center={userLocation}
      zoom={15}
      zoomControl={false}
      className="w-full h-full"
      style={{ background: "#0A0A0A" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      <ZoomControl position="bottomright" />
      <MapUpdater center={userLocation} />

      {checkpoints.map((cp) => (
        <CheckpointMarker
          key={cp.id}
          checkpoint={cp}
          onSelect={onCheckpointSelect}
        />
      ))}
    </MapContainer>
  );
}
