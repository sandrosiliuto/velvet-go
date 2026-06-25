"use client";

import { useState, FormEvent } from "react";
import { motion } from "framer-motion";
import { VelvetIsoLogo } from "@/components/velvet-logo";
import { VIPBadge } from "@/components/vip-badge";
import {
  Loader2,
  Trash2,
  Users,
  AlertTriangle,
  Gift,
  MapPin,
  Plus,
} from "lucide-react";

type User = {
  id: string;
  name: string;
  phone: string;
  photo_url: string;
  created_at: string;
};

type Reward = {
  id: string;
  title: string;
  type: string;
  code: string;
  is_active: boolean;
  quantity_total?: number | null;
  quantity_claimed?: number;
  created_at: string;
};

type Checkpoint = {
  id: string;
  name: string;
  type: string;
  lat?: number;
  lng?: number;
  radius_meters: number;
  reward_id?: string | null;
  reward?: { title?: string } | null;
  is_active: boolean;
};

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [tab, setTab] = useState<"users" | "rewards" | "checkpoints">("users");
  const [users, setUsers] = useState<User[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<{ type: string; id?: string } | null>(null);

  const authHeaders = { Authorization: `Bearer ${password}` };

  const login = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/users", { headers: authHeaders });
    if (!res.ok) {
      setError("Contraseña incorrecta");
      setLoading(false);
      return;
    }

    const data = await res.json();
    setUsers(data.users || []);
    setLoggedIn(true);
    setLoading(false);
  };

  const loadRewards = async () => {
    const res = await fetch("/api/admin/rewards", { headers: authHeaders });
    const data = await res.json();
    setRewards(data.rewards || []);
  };

  const loadCheckpoints = async () => {
    const res = await fetch("/api/admin/checkpoints", { headers: authHeaders });
    const data = await res.json();
    setCheckpoints(data.checkpoints || []);
  };

  const switchTab = async (next: "users" | "rewards" | "checkpoints") => {
    setTab(next);
    if (next === "rewards") await loadRewards();
    if (next === "checkpoints") await loadCheckpoints();
  };

  const deleteAll = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/delete-all", {
      method: "DELETE",
      headers: authHeaders,
    });
    setLoading(false);
    setConfirmDelete(null);

    if (res.ok) {
      setUsers([]);
      setRewards([]);
      setCheckpoints([]);
    } else {
      setError("Error borrando datos");
    }
  };

  const createReward = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const body = {
      title: fd.get("title"),
      description: fd.get("description"),
      type: fd.get("type"),
      code: fd.get("code") || undefined,
      partner_name: fd.get("partner_name"),
      quantity_total: fd.get("quantity_total")
        ? parseInt(fd.get("quantity_total") as string, 10)
        : null,
      starts_at: fd.get("starts_at") || null,
      expires_at: fd.get("expires_at") || null,
      image_url: fd.get("image_url"),
      is_active: true,
    };

    const res = await fetch("/api/admin/rewards", {
      method: "POST",
      headers: { ...authHeaders, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      form.reset();
      await loadRewards();
    } else {
      setError("Error creando reward");
    }
  };

  const createCheckpoint = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const body = {
      name: fd.get("name"),
      type: fd.get("type"),
      lat: parseFloat(fd.get("lat") as string),
      lng: parseFloat(fd.get("lng") as string),
      radius_meters: parseInt(fd.get("radius_meters") as string, 10),
      reward_id: fd.get("reward_id") || null,
      challenge: fd.get("challenge") || null,
      is_active: true,
    };

    const res = await fetch("/api/admin/checkpoints", {
      method: "POST",
      headers: { ...authHeaders, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      form.reset();
      await loadCheckpoints();
    } else {
      setError("Error creando checkpoint");
    }
  };

  const deleteReward = async (id: string) => {
    const res = await fetch(`/api/admin/rewards?id=${id}`, {
      method: "DELETE",
      headers: authHeaders,
    });
    if (res.ok) await loadRewards();
    setConfirmDelete(null);
  };

  const deleteCheckpoint = async (id: string) => {
    const res = await fetch(`/api/admin/checkpoints?id=${id}`, {
      method: "DELETE",
      headers: authHeaders,
    });
    if (res.ok) await loadCheckpoints();
    setConfirmDelete(null);
  };

  if (!loggedIn) {
    return (
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-dvh flex flex-col items-center justify-center px-6"
      >
        <div className="flex flex-col items-center mb-8">
          <VelvetIsoLogo className="w-20 h-20 mb-4" />
          <h1 className="font-[family-name:var(--font-cinzel)] text-2xl tracking-[0.2em] text-[#f4eade]">
            VELVET
          </h1>
          <VIPBadge className="mt-3" />
        </div>

        <form
          onSubmit={login}
          className="glass rounded-2xl p-6 w-full max-w-sm velvet-glow space-y-4"
        >
          <label className="block text-xs uppercase tracking-wider text-[#f4eade]/70">
            Acceso administrador
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            className="w-full bg-[#0a0a0a]/60 border border-[#f4eade]/10 rounded-lg px-4 py-3 text-[#f4eade] placeholder:text-[#f4eade]/30 focus:outline-none focus:border-[#b76e79]"
          />

          {error && (
            <p className="text-[#b76e79] text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#b76e79] hover:bg-[#a05d68] disabled:opacity-60 text-white font-semibold py-3 rounded-lg transition-colors uppercase tracking-widest"
          >
            {loading ? "Verificando..." : "Entrar"}
          </button>
        </form>
      </motion.main>
    );
  }

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-dvh pt-24 pb-8 px-4 max-w-2xl mx-auto"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-[#b76e79]" />
          <h2 className="font-[family-name:var(--font-cinzel)] text-xl tracking-widest">
            Panel Admin
          </h2>
        </div>
        <VIPBadge />
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide">
        {[
          { id: "users", label: "Usuarios", icon: Users },
          { id: "rewards", label: "Rewards", icon: Gift },
          { id: "checkpoints", label: "Checkpoints", icon: MapPin },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => switchTab(id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
              tab === id
                ? "bg-[#B76E79] text-white"
                : "bg-white/5 text-[#F4EADE]/70 hover:bg-white/10"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {tab === "users" && (
        <>
          <div className="glass rounded-2xl p-4 mb-6 flex items-center justify-between">
            <span className="text-sm text-[#f4eade]/70">
              {users.length} usuario{users.length !== 1 ? "s" : ""} registrados
            </span>
            <button
              onClick={() => setConfirmDelete({ type: "all" })}
              className="flex items-center gap-2 px-4 py-2 bg-red-900/60 hover:bg-red-900 text-red-100 rounded-lg text-sm transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Borrar todo
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 text-[#b76e79] animate-spin" />
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="glass rounded-xl p-3 flex items-center gap-3"
                >
                  <img
                    src={user.photo_url}
                    alt={user.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#f4eade] truncate">{user.name}</p>
                    <p className="text-xs text-[#f4eade]/50 truncate">{user.phone}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === "rewards" && (
        <div className="space-y-6">
          <form
            onSubmit={createReward}
            className="glass rounded-2xl p-5 space-y-3"
          >
            <h3 className="font-[family-name:var(--font-cinzel)] text-sm tracking-widest mb-2">
              Nueva reward
            </h3>
            <input
              name="title"
              required
              placeholder="Título"
              className="w-full bg-[#0a0a0a]/60 border border-[#f4eade]/10 rounded-lg px-4 py-2 text-sm text-[#f4eade] placeholder:text-[#f4eade]/30 focus:outline-none focus:border-[#b76e79]"
            />
            <textarea
              name="description"
              placeholder="Descripción"
              rows={2}
              className="w-full bg-[#0a0a0a]/60 border border-[#f4eade]/10 rounded-lg px-4 py-2 text-sm text-[#f4eade] placeholder:text-[#f4eade]/30 focus:outline-none focus:border-[#b76e79]"
            />
            <div className="grid grid-cols-2 gap-3">
              <select
                name="type"
                className="w-full bg-[#0a0a0a]/60 border border-[#f4eade]/10 rounded-lg px-4 py-2 text-sm text-[#f4eade] focus:outline-none focus:border-[#b76e79]"
              >
                <option value="discount">Descuento</option>
                <option value="gift">Regalo</option>
                <option value="experience">Experiencia</option>
                <option value="vip_access">Acceso VIP</option>
              </select>
              <input
                name="code"
                placeholder="Código (auto)"
                className="w-full bg-[#0a0a0a]/60 border border-[#f4eade]/10 rounded-lg px-4 py-2 text-sm text-[#f4eade] placeholder:text-[#f4eade]/30 focus:outline-none focus:border-[#b76e79]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                name="partner_name"
                placeholder="Partner"
                className="w-full bg-[#0a0a0a]/60 border border-[#f4eade]/10 rounded-lg px-4 py-2 text-sm text-[#f4eade] placeholder:text-[#f4eade]/30 focus:outline-none focus:border-[#b76e79]"
              />
              <input
                name="quantity_total"
                type="number"
                min={1}
                placeholder="Cantidad total"
                className="w-full bg-[#0a0a0a]/60 border border-[#f4eade]/10 rounded-lg px-4 py-2 text-sm text-[#f4eade] placeholder:text-[#f4eade]/30 focus:outline-none focus:border-[#b76e79]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                name="starts_at"
                type="datetime-local"
                className="w-full bg-[#0a0a0a]/60 border border-[#f4eade]/10 rounded-lg px-4 py-2 text-sm text-[#f4eade] focus:outline-none focus:border-[#b76e79]"
              />
              <input
                name="expires_at"
                type="datetime-local"
                className="w-full bg-[#0a0a0a]/60 border border-[#f4eade]/10 rounded-lg px-4 py-2 text-sm text-[#f4eade] focus:outline-none focus:border-[#b76e79]"
              />
            </div>
            <input
              name="image_url"
              placeholder="URL imagen"
              className="w-full bg-[#0a0a0a]/60 border border-[#f4eade]/10 rounded-lg px-4 py-2 text-sm text-[#f4eade] placeholder:text-[#f4eade]/30 focus:outline-none focus:border-[#b76e79]"
            />
            <button
              type="submit"
              className="w-full py-2 rounded-lg bg-[#B76E79] hover:bg-[#a05d68] text-white text-sm font-semibold uppercase tracking-widest flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> Crear reward
            </button>
          </form>

          <div className="space-y-3">
            {rewards.map((reward) => (
              <div
                key={reward.id}
                className="glass rounded-xl p-4 flex items-center justify-between"
              >
                <div>
                  <p className="font-semibold text-[#f4eade]">{reward.title}</p>
                  <p className="text-xs text-[#f4eade]/50">
                    {reward.type} · {reward.code}
                  </p>
                </div>
                <button
                  onClick={() => setConfirmDelete({ type: "reward", id: reward.id })}
                  className="p-2 rounded-lg hover:bg-red-900/40 text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "checkpoints" && (
        <div className="space-y-6">
          <form
            onSubmit={createCheckpoint}
            className="glass rounded-2xl p-5 space-y-3"
          >
            <h3 className="font-[family-name:var(--font-cinzel)] text-sm tracking-widest mb-2">
              Nuevo checkpoint
            </h3>
            <input
              name="name"
              required
              placeholder="Nombre"
              className="w-full bg-[#0a0a0a]/60 border border-[#f4eade]/10 rounded-lg px-4 py-2 text-sm text-[#f4eade] placeholder:text-[#f4eade]/30 focus:outline-none focus:border-[#b76e79]"
            />
            <div className="grid grid-cols-2 gap-3">
              <select
                name="type"
                className="w-full bg-[#0a0a0a]/60 border border-[#f4eade]/10 rounded-lg px-4 py-2 text-sm text-[#f4eade] focus:outline-none focus:border-[#b76e79]"
              >
                <option value="location">Ubicación</option>
                <option value="qr">QR</option>
                <option value="challenge">Reto</option>
              </select>
              <select
                name="reward_id"
                className="w-full bg-[#0a0a0a]/60 border border-[#f4eade]/10 rounded-lg px-4 py-2 text-sm text-[#f4eade] focus:outline-none focus:border-[#b76e79]"
              >
                <option value="">Sin reward</option>
                {rewards.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <input
                name="lat"
                step="any"
                required
                type="number"
                placeholder="Lat"
                className="w-full bg-[#0a0a0a]/60 border border-[#f4eade]/10 rounded-lg px-4 py-2 text-sm text-[#f4eade] placeholder:text-[#f4eade]/30 focus:outline-none focus:border-[#b76e79]"
              />
              <input
                name="lng"
                step="any"
                required
                type="number"
                placeholder="Lng"
                className="w-full bg-[#0a0a0a]/60 border border-[#f4eade]/10 rounded-lg px-4 py-2 text-sm text-[#f4eade] placeholder:text-[#f4eade]/30 focus:outline-none focus:border-[#b76e79]"
              />
              <input
                name="radius_meters"
                type="number"
                defaultValue={50}
                placeholder="Radio m"
                className="w-full bg-[#0a0a0a]/60 border border-[#f4eade]/10 rounded-lg px-4 py-2 text-sm text-[#f4eade] placeholder:text-[#f4eade]/30 focus:outline-none focus:border-[#b76e79]"
              />
            </div>
            <input
              name="challenge"
              placeholder="Reto / instrucción"
              className="w-full bg-[#0a0a0a]/60 border border-[#f4eade]/10 rounded-lg px-4 py-2 text-sm text-[#f4eade] placeholder:text-[#f4eade]/30 focus:outline-none focus:border-[#b76e79]"
            />
            <button
              type="submit"
              className="w-full py-2 rounded-lg bg-[#B76E79] hover:bg-[#a05d68] text-white text-sm font-semibold uppercase tracking-widest flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> Crear checkpoint
            </button>
          </form>

          <div className="space-y-3">
            {checkpoints.map((cp) => (
              <div
                key={cp.id}
                className="glass rounded-xl p-4 flex items-center justify-between"
              >
                <div>
                  <p className="font-semibold text-[#f4eade]">{cp.name}</p>
                  <p className="text-xs text-[#f4eade]/50">
                    {cp.type} · {cp.radius_meters}m
                    {cp.reward?.title && ` · ${cp.reward.title}`}
                  </p>
                </div>
                <button
                  onClick={() => setConfirmDelete({ type: "checkpoint", id: cp.id })}
                  className="p-2 rounded-lg hover:bg-red-900/40 text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confirmación borrar */}
      {confirmDelete && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="glass-strong rounded-2xl p-6 max-w-sm w-full text-center">
            <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-4" />
            <h3 className="font-[family-name:var(--font-cinzel)] text-lg mb-2">
              ¿Borrar {confirmDelete.type === "all" ? "todo" : confirmDelete.type}?
            </h3>
            <p className="text-sm text-[#f4eade]/60 mb-6">
              {confirmDelete.type === "all"
                ? "Eliminará todos los usuarios, swipes, matches, fotos, rewards y checkpoints. No se puede deshacer."
                : "Esta acción no se puede deshacer."}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2 rounded-lg border border-[#f4eade]/20 text-[#f4eade] hover:bg-[#f4eade]/5"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (confirmDelete.type === "all") deleteAll();
                  else if (confirmDelete.type === "reward" && confirmDelete.id)
                    deleteReward(confirmDelete.id);
                  else if (confirmDelete.type === "checkpoint" && confirmDelete.id)
                    deleteCheckpoint(confirmDelete.id);
                }}
                className="flex-1 py-2 rounded-lg bg-red-700 hover:bg-red-800 text-white"
              >
                Sí, borrar
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.main>
  );
}
