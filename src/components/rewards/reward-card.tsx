"use client";

import { motion } from "framer-motion";
import { Gift, Ticket, Crown, Sparkles, Clock } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

type Reward = {
  id: string;
  title: string;
  description?: string | null;
  type: "discount" | "gift" | "experience" | "vip_access";
  code?: string | null;
  partner_name?: string | null;
  partner_logo_url?: string | null;
  image_url?: string | null;
  quantity_total?: number | null;
  quantity_claimed?: number;
  starts_at?: string | null;
  expires_at?: string | null;
  status?: "unlocked" | "claimed" | "redeemed" | "expired" | string;
};

const typeConfig = {
  discount: { icon: Ticket, label: "Descuento", color: "text-emerald-400" },
  gift: { icon: Gift, label: "Regalo", color: "text-rose-400" },
  experience: { icon: Sparkles, label: "Experiencia", color: "text-amber-400" },
  vip_access: { icon: Crown, label: "Acceso VIP", color: "text-purple-400" },
};

export function RewardCard({
  reward,
  showQR = false,
  onClaim,
  compact = false,
}: {
  reward: Reward;
  showQR?: boolean;
  onClaim?: () => void;
  compact?: boolean;
}) {
  const TypeIcon = typeConfig[reward.type]?.icon ?? Gift;
  const typeLabel = typeConfig[reward.type]?.label ?? "Recompensa";
  const typeColor = typeConfig[reward.type]?.color ?? "text-rose-400";

  const remaining =
    reward.quantity_total != null
      ? Math.max(0, reward.quantity_total - (reward.quantity_claimed ?? 0))
      : null;

  const expired =
    reward.expires_at && new Date(reward.expires_at) < new Date();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="velvet-glass rounded-2xl border border-[#B76E79]/10 overflow-hidden"
    >
      {reward.image_url && (
        <div className="relative h-40 w-full">
          <img
            src={reward.image_url}
            alt={reward.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 left-3 flex items-center gap-2 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur text-[10px] uppercase tracking-wider font-semibold">
            <TypeIcon className={`w-3.5 h-3.5 ${typeColor}`} />
            <span className="text-[#F4EADE]">{typeLabel}</span>
          </div>
        </div>
      )}

      <div className={`p-5 ${compact ? "p-4" : ""}`}>
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="font-[family-name:var(--font-cinzel)] text-lg text-[#F4EADE] leading-tight">
            {reward.title}
          </h3>
          {!reward.image_url && (
            <TypeIcon className={`w-5 h-5 shrink-0 ${typeColor}`} />
          )}
        </div>

        {reward.partner_name && (
          <div className="flex items-center gap-2 text-xs text-[#F2D7D3]/70 mb-3">
            {reward.partner_logo_url && (
              <img
                src={reward.partner_logo_url}
                alt=""
                className="w-5 h-5 rounded-full object-cover"
              />
            )}
            <span>{reward.partner_name}</span>
          </div>
        )}

        {reward.description && (
          <p className="text-sm text-[#F2D7D3]/80 leading-relaxed mb-4">
            {reward.description}
          </p>
        )}

        <div className="flex flex-wrap gap-3 text-[10px] uppercase tracking-wider text-[#F2D7D3]/60 mb-4">
          {remaining != null && (
            <span className="flex items-center gap-1">
              <Ticket className="w-3.5 h-3.5" />
              {remaining} disponibles
            </span>
          )}
          {reward.expires_at && (
            <span className={`flex items-center gap-1 ${expired ? "text-red-400" : ""}`}>
              <Clock className="w-3.5 h-3.5" />
              {expired ? "Caducada" : `Hasta ${new Date(reward.expires_at).toLocaleDateString("es-ES")}`}
            </span>
          )}
        </div>

        {showQR && reward.code ? (
          <div className="flex flex-col items-center gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/5">
            <QRCodeSVG
              value={reward.code}
              size={compact ? 120 : 160}
              bgColor="transparent"
              fgColor="#F4EADE"
              level="M"
            />
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-widest text-[#F2D7D3]/50 mb-1">Código de canje</p>
              <p className="font-mono text-lg text-[#B76E79] tracking-widest">{reward.code}</p>
            </div>
          </div>
        ) : onClaim ? (
          <button
            onClick={onClaim}
            disabled={expired}
            className="w-full py-3 rounded-xl metallic-rose-gold text-sm font-semibold tracking-widest uppercase disabled:opacity-50"
          >
            {expired ? "Caducada" : "Reclamar ahora"}
          </button>
        ) : null}
      </div>
    </motion.div>
  );
}
