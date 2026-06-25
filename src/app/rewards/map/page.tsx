"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { ChevronLeft, Loader2, MapPin, Navigation } from "lucide-react";
import Link from "next/link";
import { RewardClaimModal } from "@/components/rewards/reward-claim-modal";

type Checkpoint = {
  id: string;
  name: string;
  type: "location" | "qr" | "challenge";
  lat: number;
  lng: number;
  radius_meters: number;
  reward_id?: string | null;
  reward?: Record<string, unknown> | null;
  distance_meters?: number;
  challenge?: string | null;
};

const RewardsMap = dynamic(
  () => import("@/components/rewards/rewards-map").then((m) => m.RewardsMap),
  { ssr: false, loading: () => <MapLoading /> }
);

function MapLoading() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[#0A0A0A]">
      <Loader2 className="w-8 h-8 text-[#B76E79] animate-spin" />
    </div>
  );
}

const MALAGA_CENTER: [number, number] = [36.7213, -4.4214];

export default function RewardsMapPage() {
  const router = useRouter();
  const [location, setLocation] = useState<[number, number]>(MALAGA_CENTER);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [selected, setSelected] = useState<Checkpoint | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: [number, number] = [
          pos.coords.latitude,
          pos.coords.longitude,
        ];
        setLocation(coords);
        setLoadingLocation(false);
        fetchNearby(coords);
      },
      () => {
        setLoadingLocation(false);
        fetchNearby(MALAGA_CENTER);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const fetchNearby = async (coords: [number, number]) => {
    setLoadingData(true);
    try {
      const res = await fetch(
        `/api/rewards/nearby?lat=${coords[0]}&lng=${coords[1]}&radius=10000`
      );
      if (res.status === 401) {
        router.push("/");
        return;
      }
      const data = await res.json();
      setCheckpoints(data.checkpoints ?? []);
    } catch {
      setError("Error cargando checkpoints");
    } finally {
      setLoadingData(false);
    }
  };

  const recenter = () => {
    if (typeof window === "undefined") return;
    navigator.geolocation.getCurrentPosition((pos) => {
      const coords: [number, number] = [
        pos.coords.latitude,
        pos.coords.longitude,
      ];
      setLocation(coords);
      fetchNearby(coords);
    });
  };

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-[#0A0A0A]"
    >
      <header className="absolute top-0 left-0 right-0 z-[400] px-4 pt-4 pb-2">
        <div className="flex items-center gap-3 max-w-md mx-auto">
          <Link
            href="/rewards"
            className="p-2 rounded-full bg-black/60 backdrop-blur text-[#F4EADE]/80 hover:text-[#F4EADE]"
          >
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <div className="flex-1">
            <h1 className="font-[family-name:var(--font-cinzel)] text-lg text-[#F4EADE] tracking-wide">
              Mapa VIP
            </h1>
            <p className="text-[10px] text-[#F2D7D3]/60">
              {loadingLocation ? "Localizando..." : "Checkpoints cercanos"}
            </p>
          </div>
          <button
            onClick={recenter}
            className="p-2 rounded-full bg-black/60 backdrop-blur text-[#B76E79] hover:bg-black/80"
          >
            <Navigation className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="absolute inset-0">
        {!loadingLocation && (
          <RewardsMap
            userLocation={location}
            checkpoints={checkpoints}
            onCheckpointSelect={setSelected}
          />
        )}
      </div>

      {loadingData && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-[400] px-4 py-2 rounded-full bg-black/70 backdrop-blur text-xs text-[#F4EADE] flex items-center gap-2">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          Cargando checkpoints...
        </div>
      )}

      <RewardClaimModal
        checkpoint={selected}
        userLocation={location}
        onClose={() => setSelected(null)}
        onClaimed={() => {
          fetchNearby(location);
          setTimeout(() => setSelected(null), 1500);
        }}
      />
    </motion.main>
  );
}
