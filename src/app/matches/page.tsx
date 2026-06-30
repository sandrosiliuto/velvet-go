"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { VelvetHeader } from "@/components/velvet-header";
import { StarLogo } from "@/components/velvet-logo";
import Link from "next/link";

type Match = {
  id: string;
  created_at: string;
  other: {
    id: string;
    name: string;
    phone: string;
    photo_url: string;
  };
};

const demoMatches: Match[] = [
  {
    id: "demo-match-1",
    created_at: new Date().toISOString(),
    other: {
      id: "demo-cristina",
      name: "Cristina",
      phone: "612345678",
      photo_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    },
  },
  {
    id: "demo-match-2",
    created_at: new Date().toISOString(),
    other: {
      id: "demo-lucia",
      name: "Lucía",
      phone: "634567890",
      photo_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
    },
  },
];

export default function MatchesPage() {
  const router = useRouter();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/matches")
      .then((res) => res.json())
      .then((data) => {
        setMatches(data.matches?.length ? data.matches : demoMatches);
      })
      .catch((err) => {
        console.error(err);
        setMatches(demoMatches);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  return (
    <>
      <VelvetHeader />
      <main className="relative z-10 min-h-dvh pt-24 pb-8 px-4 max-w-md mx-auto">
        <h2 className="font-[family-name:var(--font-cinzel)] text-2xl tracking-wide text-[#F4EADE] mb-6 text-center">Conversaciones</h2>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-[#B76E79] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : matches.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="velvet-glass rounded-3xl p-8 text-center border border-[#B76E79]/10"
          >
            <StarLogo className="w-10 h-10 mx-auto mb-4 opacity-60" />
            <p className="text-[#F2D7D3]/70">Aún no tienes matches. Sigue descubriendo contactos VIP.</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {matches.map((match, idx) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                className="velvet-glass rounded-2xl p-4 flex items-center gap-4 border border-white/5"
              >
                <div className="w-16 h-16 rounded-full p-[2px] metallic-rose-gold">
                  <img
                    src={match.other.photo_url}
                    alt={match.other.name}
                    className="w-full h-full rounded-full object-cover border-2 border-[#0A0A0A]"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-[family-name:var(--font-cinzel)] font-semibold text-[#F4EADE] truncate">
                    {match.other.name}
                  </h3>
                  <p className="text-sm text-[#F2D7D3]/50 truncate">{match.other.phone}</p>
                </div>
                <a
                  href={`https://wa.me/34${match.other.phone.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-green-600 hover:bg-green-700 text-white transition-colors"
                  aria-label="WhatsApp"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </a>
              </motion.div>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-3 mt-8">
          <Link
            href="/discover"
            className="w-full text-center py-3 rounded-2xl border border-[#B76E79]/40 text-[#F4EADE] hover:bg-[#B76E79]/10 transition-colors text-sm uppercase tracking-widest"
          >
            Seguir descubriendo
          </Link>
          <button
            onClick={handleLogout}
            className="w-full text-center py-3 text-xs uppercase tracking-widest text-[#F4EADE]/40 hover:text-[#F4EADE] transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </main>

      <footer className="relative z-10 border-t border-white/5 py-8 text-center">
        <p className="font-[family-name:var(--font-cinzel)] text-[#B76E79] text-sm tracking-[0.25em] uppercase mb-2">VELVET GO</p>
        <p className="text-[#F2D7D3]/50 text-xs tracking-widest">EN LA VIDA TODO SON CONTACTOS · VIP</p>
      </footer>
    </>
  );
}
