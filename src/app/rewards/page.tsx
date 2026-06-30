"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronLeft, Loader2, MapPin, Crown, Gift } from "lucide-react";
import Link from "next/link";
import { RewardCard } from "@/components/rewards/reward-card";

type UserReward = {
  id: string;
  status: "unlocked" | "claimed" | "redeemed" | "expired";
  reward: {
    id: string;
    title: string;
    type: "discount" | "gift" | "experience" | "vip_access";
    description?: string | null;
    code?: string | null;
    partner_name?: string | null;
    partner_logo_url?: string | null;
    image_url?: string | null;
    quantity_total?: number | null;
    quantity_claimed?: number;
    starts_at?: string | null;
    expires_at?: string | null;
  };
};

export default function RewardsPage() {
  const router = useRouter();
  const [rewards, setRewards] = useState<UserReward[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const userId = document.cookie
      .split("; ")
      .find((row) => row.startsWith("velvet_user_id_v2="))
      ?.split("=")[1];

    fetch("/api/rewards", {
      credentials: "include",
      headers: userId ? { "X-User-Id": userId } : {},
    })
      .then((res) => {
        if (res.status === 401) {
          router.push("/");
          return null;
        }
        return res.json();
      })
      .then((data: { rewards?: UserReward[] }) => {
        if (data) setRewards(data.rewards ?? []);
      })
      .catch(() => setError("Error cargando recompensas"))
      .finally(() => setLoading(false));
  }, [router]);

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-dvh pt-6 pb-24 px-4 max-w-md mx-auto"
    >
      <header className="flex items-center gap-3 mb-6">
        <Link
          href="/discover"
          className="p-2 rounded-full hover:bg-white/5 text-[#F4EADE]/70 hover:text-[#F4EADE]"
        >
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <div className="flex-1">
          <h1 className="font-[family-name:var(--font-cinzel)] text-xl text-[#F4EADE] tracking-wide">
            Mis recompensas
          </h1>
          <p className="text-xs text-[#F2D7D3]/50">VIP · Canjeables exclusivos</p>
        </div>
        <Link
          href="/rewards/map"
          className="p-2 rounded-full bg-[#B76E79]/20 text-[#B76E79] hover:bg-[#B76E79]/30"
        >
          <MapPin className="w-5 h-5" />
        </Link>
      </header>

      <Link
        href="/rewards/map"
        className="block w-full mb-6 py-3 rounded-2xl metallic-rose-gold text-center text-sm font-semibold tracking-widest uppercase"
      >
        Explorar mapa VIP
      </Link>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 text-[#B76E79] animate-spin" />
        </div>
      ) : error ? (
        <p className="text-center text-red-400 py-12">{error}</p>
      ) : rewards.length === 0 ? (
        <div className="text-center py-16 velvet-glass rounded-3xl border border-[#B76E79]/10">
          <Crown className="w-12 h-12 text-[#B76E79]/40 mx-auto mb-4" />
          <h3 className="font-[family-name:var(--font-cinzel)] text-lg text-[#F4EADE] mb-2">
            Aún no tienes recompensas
          </h3>
          <p className="text-sm text-[#F2D7D3]/60 mb-6 px-6">
            Descubre checkpoints exclusivos en el mapa y desbloquea experiencias VIP.
          </p>
          <Link
            href="/rewards/map"
            className="inline-block px-6 py-2 rounded-xl metallic-rose-gold text-sm font-semibold"
          >
            Ir al mapa
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {rewards.map((item) => (
            <RewardCard
              key={item.id}
              reward={{
                ...item.reward,
                status: item.status,
              }}
              showQR
            />
          ))}
        </div>
      )}
    </motion.main>
  );
}
