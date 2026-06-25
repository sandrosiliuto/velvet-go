"use client";

import Link from "next/link";
import { StarLogo } from "./velvet-logo";

export function VelvetHeader() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 h-14 velvet-glass border-b border-white/5">
      <div className="max-w-md mx-auto h-full px-6 flex items-center justify-between">
        <Link href="/discover" className="flex items-center gap-2">
          <StarLogo className="w-[22px] h-[22px]" />
          <span className="font-[family-name:var(--font-cinzel)] text-xs tracking-logo text-[#F2D7D3]">
            VELVET
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="vip-badge">VIP</span>
          <span className="text-[10px] text-[#F2D7D3]/70 tracking-wide hidden sm:inline">
            ACCESO EXCLUSIVO
          </span>
        </div>
      </div>
    </header>
  );
}
