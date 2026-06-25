"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import confetti from "canvas-confetti";
import { VelvetHeader } from "@/components/velvet-header";
import { StarLogo, VelvetIsoLogo } from "@/components/velvet-logo";
import Link from "next/link";

type Profile = {
  id: string;
  name: string;
  phone: string;
  photo_url: string;
  created_at: string;
};

const placeholderProfiles: Profile[] = [
  {
    id: "demo-cristina",
    name: "Cristina, 29",
    phone: "612345678",
    photo_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
    created_at: new Date().toISOString(),
  },
  {
    id: "demo-andres",
    name: "Andrés, 34",
    phone: "623456789",
    photo_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
    created_at: new Date().toISOString(),
  },
  {
    id: "demo-lucia",
    name: "Lucía, 27",
    phone: "634567890",
    photo_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80",
    created_at: new Date().toISOString(),
  },
];

const interests = ["Arte contemporáneo", "Vinos", "Náutica"];

export default function DiscoverPage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [direction, setDirection] = useState<"left" | "right" | null>(null);
  const [matchData, setMatchData] = useState<Profile | null>(null);
  const [dragX, setDragX] = useState(0);

  const fetchProfiles = useCallback(async () => {
    try {
      const res = await fetch("/api/profiles");
      if (!res.ok) throw new Error("Error cargando perfiles");
      const data = await res.json();
      setProfiles(data.profiles?.length ? data.profiles : placeholderProfiles);
    } catch (err) {
      console.error(err);
      setProfiles(placeholderProfiles);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const currentProfile = profiles[currentIndex];

  const handleSwipe = async (swipedId: string, dir: "like" | "pass") => {
    setDirection(dir === "like" ? "right" : "left");
    try {
      const res = await fetch("/api/swipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ swipedId, direction: dir }),
      });
      const data = await res.json();
      if (data.matched) {
        const matched = profiles.find((p) => p.id === swipedId);
        if (matched) {
          setMatchData(matched);
          confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.6 },
            colors: ["#B76E79", "#F4EADE", "#2B1F2A"],
          });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => {
        setCurrentIndex((i) => i + 1);
        setDirection(null);
        setDragX(0);
      }, 300);
    }
  };

  const onDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (!currentProfile) return;
    if (info.offset.x > 100) handleSwipe(currentProfile.id, "like");
    else if (info.offset.x < -100) handleSwipe(currentProfile.id, "pass");
  };

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  return (
    <>
      <VelvetHeader />
      <main className="relative z-10 pt-20 pb-24">
        <section className="px-4 max-w-md mx-auto mb-16">
          <div className="velvet-glass rounded-3xl p-6 border border-[#B76E79]/10 relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-[family-name:var(--font-cinzel)] text-xl tracking-wide text-[#F4EADE]">Recompensas VIP</h2>
              <span className="vip-badge text-[10px]">GO</span>
            </div>
            <p className="text-[#F2D7D3]/80 text-sm mb-5 leading-relaxed">
              Descubre checkpoints exclusivos, completa retos y desbloquea experiencias solo para miembros VELVET.
            </p>
            <Link
              href="/rewards/map"
              className="block w-full py-3 rounded-xl metallic-rose-gold text-center text-sm font-semibold tracking-widest uppercase"
            >
              Explorar mapa
            </Link>
          </div>
        </section>

        <section className="px-4 max-w-md mx-auto mb-16">
          <div className="flex items-end justify-between mb-5 px-2">
            <h2 className="font-[family-name:var(--font-cinzel)] text-2xl text-[#F4EADE] tracking-wide">Descubre</h2>
            <span className="vip-badge text-[10px]">VIP</span>
          </div>

          {loading ? (
            <div className="h-96 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-[#B76E79] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="relative w-full aspect-[3/4]">
              <AnimatePresence mode="popLayout">
                {currentProfile ? (
                  <motion.article
                    key={currentProfile.id}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1, x: 0, rotate: 0 }}
                    exit={{
                      x: direction === "right" ? 300 : -300,
                      rotate: direction === "right" ? 20 : -20,
                      opacity: 0,
                    }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    onDrag={(_, info) => setDragX(info.offset.x)}
                    onDragEnd={onDragEnd}
                    className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl border border-[#B76E79]/10 group cursor-grab active:cursor-grabbing bg-[#2B1F2A]"
                  >
                    <img
                      src={currentProfile.photo_url}
                      alt={currentProfile.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/40 to-transparent" />

                    <div className="absolute bottom-0 inset-x-0 p-6">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-[family-name:var(--font-cinzel)] text-2xl tracking-wide text-[#F4EADE]">
                          {currentProfile.name}
                        </h3>
                        <StarLogo className="w-[18px] h-[18px]" />
                      </div>
                      <p className="text-[#F2D7D3]/80 text-sm mb-4">Arte · Viajes · Alta gastronomía · Málaga</p>
                      <div className="flex flex-wrap gap-2 mb-5">
                        {interests.map((i) => (
                          <span key={i} className="pill">{i}</span>
                        ))}
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleSwipe(currentProfile.id, "pass")}
                          className="flex-1 py-3 rounded-xl velvet-glass text-[#F4EADE] text-sm font-medium tracking-wider hover:bg-white/5 transition border border-white/10"
                        >
                          Descartar
                        </button>
                        <button
                          onClick={() => handleSwipe(currentProfile.id, "like")}
                          className="flex-1 py-3 rounded-xl metallic-rose-gold text-sm font-semibold tracking-wider shadow-lg hover:shadow-rose-500/30 transition"
                        >
                          Conectar
                        </button>
                      </div>
                    </div>

                    <motion.div
                      className="absolute top-5 left-5 border-4 border-green-400 text-green-400 px-4 py-2 rounded-xl font-bold tracking-widest uppercase rotate-[-15deg] pointer-events-none"
                      animate={{ opacity: dragX > 40 ? Math.min((dragX - 40) / 80, 1) : 0 }}
                    >
                      Like
                    </motion.div>
                    <motion.div
                      className="absolute top-5 right-5 border-4 border-red-400 text-red-400 px-4 py-2 rounded-xl font-bold tracking-widest uppercase rotate-[15deg] pointer-events-none"
                      animate={{ opacity: dragX < -40 ? Math.min((-dragX - 40) / 80, 1) : 0 }}
                    >
                      Pass
                    </motion.div>
                  </motion.article>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute inset-0 velvet-glass rounded-3xl p-6 border border-[#B76E79]/10 flex flex-col items-center justify-center text-center"
                  >
                    <VelvetIsoLogo className="w-16 h-16 mb-4 opacity-60" />
                    <h3 className="font-[family-name:var(--font-cinzel)] text-xl text-[#F4EADE] mb-2">No hay más perfiles</h3>
                    <p className="text-[#F2D7D3]/60 text-sm mb-6">Vuelve más tarde para descubrir nuevos contactos VIP.</p>
                    <button
                      onClick={() => {
                        setCurrentIndex(0);
                        fetchProfiles();
                      }}
                      className="px-6 py-2 rounded-xl metallic-rose-gold text-sm font-semibold"
                    >
                      Recargar
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </section>

        <section className="px-4 max-w-md mx-auto mb-16">
          <div className="velvet-glass rounded-3xl p-6 border border-[#B76E79]/10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-[family-name:var(--font-cinzel)] text-xl tracking-wide text-[#F4EADE]">Perfil destacado</h2>
              <span className="vip-badge text-[10px]">VIP</span>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
                "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80",
                "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80",
                "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
              ].map((src, idx) => (
                <div key={idx} className="aspect-square rounded-2xl overflow-hidden border border-[#B76E79]/10">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <p className="text-[#F2D7D3]/80 text-sm leading-relaxed mb-4">
              Coleccionista de atardeceres, conversaciones que dejan huella y contactos que cambian el rumbo. Creo en el lujo de la intimidad.
            </p>
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/5">
              <div className="w-10 h-10 rounded-full metallic-rose-gold flex items-center justify-center text-[#0A0A0A] font-bold text-xs">▶</div>
              <div>
                <p className="text-xs text-[#F2D7D3]/60 uppercase tracking-wide">Nota de voz</p>
                <p className="text-sm text-[#F4EADE]">0:18 · Solo contactos VIP</p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 max-w-md mx-auto mb-16">
          <div className="flex items-center justify-between mb-4 px-2">
            <h2 className="font-[family-name:var(--font-cinzel)] text-2xl text-[#F4EADE] tracking-wide">Conversaciones</h2>
            <span className="vip-badge text-[10px]">VIP</span>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 mb-2 scrollbar-hide">
            {[
              { name: "Cris", src: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80" },
              { name: "Andrés", src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80" },
              { name: "Lucía", src: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80" },
            ].map((u) => (
              <div key={u.name} className="flex flex-col items-center gap-1 min-w-[64px]">
                <div className="w-16 h-16 rounded-full p-[2px] metallic-rose-gold">
                  <img src={u.src} alt="" className="w-full h-full rounded-full object-cover border-2 border-[#0A0A0A]" />
                </div>
                <span className="text-[10px] text-[#F2D7D3]/80">{u.name}</span>
              </div>
            ))}
          </div>

          <div className="velvet-glass rounded-3xl p-5 border border-[#B76E79]/10 min-h-[280px] flex flex-col">
            <div className="flex-1 space-y-4">
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-2xl rounded-tl-none bg-[#2B1F2A] px-4 py-3 text-sm text-[#F4EADE] border border-white/5">
                  ¿Asistes al evento del rooftop este jueves?
                </div>
              </div>
              <div className="flex justify-end">
                <div className="max-w-[80%] rounded-2xl rounded-tr-none bg-[#B76E79] px-4 py-3 text-sm text-[#0A0A0A] font-medium shadow-lg">
                  Solo si tengo mi pase VIP confirmado.
                </div>
              </div>
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-2xl rounded-tl-none bg-[#2B1F2A] px-4 py-3 text-sm text-[#F4EADE] border border-white/5">
                  Ya está reservado. Nos vemos al atardecer.
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <input
                type="text"
                placeholder="Escribe un mensaje..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-[#F4EADE] placeholder:text-[#F2D7D3]/40 focus:outline-none focus:border-[#B76E79]/40"
              />
              <button className="w-11 h-11 rounded-xl metallic-rose-gold flex items-center justify-center text-[#0A0A0A] font-bold shadow-lg">→</button>
            </div>
          </div>
        </section>

        <section className="px-6 text-center max-w-md mx-auto">
          <div className="velvet-glass rounded-3xl p-8 border border-[#B76E79]/20">
            <StarLogo className="w-8 h-8 mx-auto mb-4" />
            <h2 className="font-[family-name:var(--font-cinzel)] text-2xl tracking-wide text-[#F4EADE] mb-2">Membresía VIP</h2>
            <p className="text-[#F2D7D3]/80 text-sm mb-6">Acceso prioritario, perfiles verificados con destello estelar y eventos exclusivos.</p>
            <Link
              href="/matches"
              className="block w-full py-4 rounded-2xl metallic-rose-gold font-semibold tracking-widest uppercase text-sm shadow-lg hover:shadow-rose-500/30 transition-all duration-300"
            >
              Ver matches
            </Link>
          </div>
        </section>

        <div className="px-4 max-w-md mx-auto mt-8 flex flex-col gap-3">
          <button
            onClick={handleLogout}
            className="w-full text-center py-3 text-xs uppercase tracking-widest text-[#F4EADE]/40 hover:text-[#F4EADE] transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </main>

      <footer className="relative z-10 border-t border-white/5 py-8 text-center">
        <p className="font-[family-name:var(--font-cinzel)] text-[#B76E79] text-sm tracking-[0.25em] uppercase mb-2">VELVET contactos · GO</p>
        <p className="text-[#F2D7D3]/50 text-xs tracking-widest">EN LA VIDA TODO SON CONTACTOS · VIP</p>
      </footer>

      <AnimatePresence>
        {matchData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="velvet-glass rounded-3xl p-8 max-w-sm w-full text-center border border-[#B76E79]/20"
            >
              <StarLogo className="w-12 h-12 mx-auto mb-4" />
              <h3 className="font-[family-name:var(--font-cinzel)] text-2xl text-[#F4EADE] mb-2">¡Match VIP!</h3>
              <p className="text-[#F2D7D3]/70 mb-6">Tú y {matchData.name} os habéis gustado.</p>
              <img
                src={matchData.photo_url}
                alt={matchData.name}
                className="w-24 h-24 rounded-full object-cover mx-auto mb-4 border-2 border-[#B76E79]"
              />
              <a
                href={`https://wa.me/34${matchData.phone.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl mb-3"
              >
                Abrir WhatsApp
              </a>
              <button
                onClick={() => setMatchData(null)}
                className="text-sm text-[#F2D7D3]/50 hover:text-[#F2D7D3]"
              >
                Seguir descubriendo
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
