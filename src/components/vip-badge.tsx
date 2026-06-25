"use client";

import { Crown } from "lucide-react";

export function VIPBadge({ className = "" }: { className?: string }) {
  return (
    <div
      className={`
        inline-flex items-center gap-1.5 px-3 py-1 rounded-full
        vip-badge text-white text-xs font-semibold tracking-widest uppercase
        ${className}
      `}
    >
      <Crown className="w-3.5 h-3.5" />
      VIP
    </div>
  );
}
