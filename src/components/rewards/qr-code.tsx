"use client";

import { QRCodeSVG } from "qrcode.react";

export function QRCode({
  value,
  size = 160,
}: {
  value: string;
  size?: number;
}) {
  return (
    <div className="flex flex-col items-center gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/5">
      <QRCodeSVG
        value={value}
        size={size}
        bgColor="transparent"
        fgColor="#F4EADE"
        level="M"
      />
      <div className="text-center">
        <p className="text-[10px] uppercase tracking-widest text-[#F2D7D3]/50 mb-1">
          Código de canje
        </p>
        <p className="font-mono text-lg text-[#B76E79] tracking-widest">{value}</p>
      </div>
    </div>
  );
}
