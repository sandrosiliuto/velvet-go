"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Gift, Loader2 } from "lucide-react";
import { useState } from "react";

type Checkpoint = {
  id: string;
  name: string;
  type: "location" | "qr" | "challenge";
  lat: number;
  lng: number;
  radius_meters: number;
  reward_id?: string | null;
  reward?: {
    id?: string;
    title?: string;
    description?: string | null;
    code?: string | null;
    image_url?: string | null;
  } | null;
  distance_meters?: number;
  challenge?: string | null;
};

export function RewardClaimModal({
  checkpoint,
  userLocation,
  onClose,
  onClaimed,
}: {
  checkpoint: Checkpoint | null;
  userLocation: [number, number] | null;
  onClose: () => void;
  onClaimed?: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [claimed, setClaimed] = useState(false);

  if (!checkpoint) return null;

  const reward = checkpoint.reward;

  const isNearby =
    checkpoint.distance_meters != null &&
    checkpoint.distance_meters <= checkpoint.radius_meters;

  const handleClaim = async () => {
    if (!reward?.id || !userLocation) return;
    setLoading(true);
    setError("");

    const res = await fetch("/api/rewards/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        checkpointId: checkpoint.id,
        lat: userLocation[0],
        lng: userLocation[1],
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Error al reclamar");
      return;
    }

    setClaimed(true);
    onClaimed?.();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
      >
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="w-full max-w-md glass-strong rounded-3xl p-6 border border-[#B76E79]/20"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#B76E79]/20 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-[#B76E79]" />
              </div>
              <div>
                <h3 className="font-[family-name:var(--font-cinzel)] text-lg text-[#F4EADE]">
                  {checkpoint.name}
                </h3>
                {reward?.title && (
                  <p className="text-sm text-[#B76E79]">{reward.title}</p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/5 text-[#F4EADE]/60 hover:text-[#F4EADE]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {reward?.image_url && (
            <div className="rounded-xl overflow-hidden mb-4 h-40">
              <img
                src={reward.image_url}
                alt={reward.title || ""}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {reward?.description && (
            <p className="text-sm text-[#F2D7D3]/80 mb-4">{reward.description}</p>
          )}

          {checkpoint.challenge && (
            <div className="rounded-xl bg-white/[0.03] border border-white/5 p-4 mb-4">
              <p className="text-[10px] uppercase tracking-widest text-[#F2D7D3]/50 mb-1">
                Reto
              </p>
              <p className="text-sm text-[#F4EADE] italic">“{checkpoint.challenge}”</p>
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-[#F2D7D3]/70 mb-5">
            <MapPin className="w-4 h-4" />
            {checkpoint.distance_meters != null ? (
              checkpoint.distance_meters < 1000 ? (
                <span>{Math.round(checkpoint.distance_meters)} m de distancia</span>
              ) : (
                <span>{(checkpoint.distance_meters / 1000).toFixed(1)} km de distancia</span>
              )
            ) : (
              <span>Radio de {checkpoint.radius_meters} m</span>
            )}
          </div>

          {claimed ? (
            <div className="text-center p-4 rounded-xl bg-emerald-900/30 border border-emerald-500/30">
              <Gift className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-emerald-100 font-semibold">¡Recompensa desbloqueada!</p>
              <p className="text-xs text-emerald-200/70 mt-1">Encuéntrala en tu listado de recompensas.</p>
            </div>
          ) : reward?.id ? (
            <>
              <button
                onClick={handleClaim}
                disabled={!isNearby || loading || !userLocation}
                className="w-full py-3 rounded-xl metallic-rose-gold text-sm font-semibold tracking-widest uppercase disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {!userLocation
                  ? "Ubicación requerida"
                  : !isNearby
                  ? "Acércate al checkpoint"
                  : "Desbloquear recompensa"}
              </button>
              {error && (
                <p className="text-center text-red-400 text-sm mt-3">{error}</p>
              )}
            </>
          ) : (
            <p className="text-center text-[#F2D7D3]/50 text-sm">
              Este checkpoint no tiene recompensa asignada.
            </p>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
