'use client'

import { useState } from 'react'

const REWARD_TYPES = [
  { value: 'discount', label: 'Descuento' },
  { value: 'gift', label: 'Regalo' },
  { value: 'experience', label: 'Experiencia' },
  { value: 'vip_access', label: 'Acceso VIP' },
]

const CHECKPOINT_TYPES = [
  { value: 'location', label: 'Ubicación' },
  { value: 'qr', label: 'QR' },
  { value: 'challenge', label: 'Reto' },
]

type Reward = {
  id: string
  title: string
  type: string
  code: string
  partner_name?: string | null
  is_active: boolean
  created_at: string
}

type Checkpoint = {
  id: string
  name: string
  type: string
  lat: number
  lng: number
  radius_meters: number
  is_active: boolean
  reward?: { title: string } | null
}

export default function AdminPage() {
  const [pw, setPw] = useState('')
  const [authed, setAuthed] = useState(false)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<'users' | 'rewards' | 'checkpoints'>('users')

  const [users, setUsers] = useState<any[]>([])
  const [rewards, setRewards] = useState<Reward[]>([])
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([])

  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleted, setDeleted] = useState(false)
  const [saving, setSaving] = useState(false)

  async function login(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch(`/api/admin/users?pw=${encodeURIComponent(pw)}`)
    if (res.ok) {
      const data = await res.json()
      setUsers(data.users)
      setAuthed(true)
      await loadRewards()
      await loadCheckpoints()
    } else {
      setError('Contraseña incorrecta')
    }
    setLoading(false)
  }

  async function loadRewards() {
    const res = await fetch('/api/admin/rewards', {
      headers: { Authorization: `Bearer ${pw}` },
    })
    if (res.ok) {
      const data = await res.json()
      setRewards(data.rewards ?? [])
    }
  }

  async function loadCheckpoints() {
    const res = await fetch('/api/admin/checkpoints', {
      headers: { Authorization: `Bearer ${pw}` },
    })
    if (res.ok) {
      const data = await res.json()
      setCheckpoints(data.checkpoints ?? [])
    }
  }

  async function deleteAll() {
    if (!confirm('¿Borrar TODOS los usuarios? Esta acción no se puede deshacer.')) return
    setDeleting(true)
    const res = await fetch(`/api/admin/delete-all?pw=${encodeURIComponent(pw)}`, {
      method: 'DELETE',
    })
    if (res.ok) {
      setUsers([])
      setDeleted(true)
    }
    setDeleting(false)
  }

  async function deleteReward(id: string) {
    if (!confirm('¿Borrar esta recompensa?')) return
    const res = await fetch(`/api/admin/rewards/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${pw}` },
    })
    if (res.ok) await loadRewards()
  }

  async function deleteCheckpoint(id: string) {
    if (!confirm('¿Borrar este checkpoint?')) return
    const res = await fetch(`/api/admin/checkpoints/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${pw}` },
    })
    if (res.ok) await loadCheckpoints()
  }

  async function createReward(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)
    const payload = {
      title: fd.get('title') as string,
      description: fd.get('description') as string,
      type: fd.get('type') as string,
      code: fd.get('code') as string,
      partner_name: fd.get('partner_name') as string,
      partner_logo_url: fd.get('partner_logo_url') as string,
      image_url: fd.get('image_url') as string,
      quantity_total: fd.get('quantity_total')
        ? Number(fd.get('quantity_total'))
        : null,
      starts_at: fd.get('starts_at') as string,
      expires_at: fd.get('expires_at') as string,
      is_active: true,
    }
    setSaving(true)
    const res = await fetch('/api/admin/rewards', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${pw}`,
      },
      body: JSON.stringify(payload),
    })
    setSaving(false)
    if (res.ok) {
      form.reset()
      await loadRewards()
    }
  }

  async function createCheckpoint(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)
    const payload = {
      name: fd.get('name') as string,
      type: fd.get('type') as string,
      lat: Number(fd.get('lat')),
      lng: Number(fd.get('lng')),
      radius_meters: Number(fd.get('radius_meters') || 50),
      reward_id: (fd.get('reward_id') as string) || null,
      challenge: fd.get('challenge') as string,
      is_active: true,
    }
    setSaving(true)
    const res = await fetch('/api/admin/checkpoints', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${pw}`,
      },
      body: JSON.stringify(payload),
    })
    setSaving(false)
    if (res.ok) {
      form.reset()
      await loadCheckpoints()
    }
  }

  if (!authed) {
    return (
      <main className="relative min-h-screen flex items-center justify-center p-4 velvet-radial">
        <header className="fixed top-0 inset-x-0 z-50 h-14 velvet-glass border-b border-white/5">
          <div className="max-w-md mx-auto h-full px-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg width="22" height="22" viewBox="0 0 200 200" fill="none" aria-hidden="true" className="sparkle">
                <path d="M100 10 L112 88 L190 100 L112 112 L100 190 L88 112 L10 100 L88 88 Z" fill="url(#roseGoldAdmin)" />
                <defs>
                  <linearGradient id="roseGoldAdmin" x1="0" y1="0" x2="200" y2="200">
                    <stop offset="0%" stopColor="#8F404C" />
                    <stop offset="35%" stopColor="#B76E79" />
                    <stop offset="55%" stopColor="#F2D7D3" />
                    <stop offset="75%" stopColor="#B76E79" />
                    <stop offset="100%" stopColor="#8F404C" />
                  </linearGradient>
                </defs>
              </svg>
              <span className="font-serif text-xs tracking-[0.35em] text-[#F2D7D3]">VELVET</span>
            </div>
            <span className="vip-badge text-[10px] font-semibold tracking-widest">ADMIN</span>
          </div>
        </header>
        <div className="relative z-10 card-border rounded-3xl p-8 w-full max-w-sm space-y-5">
          <h1 className="text-2xl font-black text-center text-[#F2D7D3] font-serif">🔐 Panel Admin</h1>
          <form onSubmit={login} className="space-y-4">
            <input
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="Contraseña"
              required
              className="w-full px-4 py-3 rounded-xl bg-[#0A0A0A] border border-[#2B1F2A] focus:border-[#B76E79]/50 outline-none transition placeholder-[#B76E79]/30 text-[#F4EADE]"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-[#0A0A0A] disabled:opacity-50 transition hover:opacity-90 metallic-rose-gold"
            >
              {loading ? 'Verificando...' : 'Entrar'}
            </button>
          </form>
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
        </div>
      </main>
    )
  }

  return (
    <main className="relative min-h-screen p-4 max-w-3xl mx-auto velvet-radial pt-16">
      <header className="fixed top-0 inset-x-0 z-50 h-14 velvet-glass border-b border-white/5">
        <div className="max-w-3xl mx-auto h-full px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg width="22" height="22" viewBox="0 0 200 200" fill="none" aria-hidden="true" className="sparkle">
              <path d="M100 10 L112 88 L190 100 L112 112 L100 190 L88 112 L10 100 L88 88 Z" fill="url(#roseGoldAdmin2)" />
              <defs>
                <linearGradient id="roseGoldAdmin2" x1="0" y1="0" x2="200" y2="200">
                  <stop offset="0%" stopColor="#8F404C" />
                  <stop offset="35%" stopColor="#B76E79" />
                  <stop offset="55%" stopColor="#F2D7D3" />
                  <stop offset="75%" stopColor="#B76E79" />
                  <stop offset="100%" stopColor="#8F404C" />
                </linearGradient>
              </defs>
            </svg>
            <span className="font-serif text-xs tracking-[0.35em] text-[#F2D7D3]">VELVET</span>
          </div>
          <span className="vip-badge text-[10px] font-semibold tracking-widest">ADMIN</span>
        </div>
      </header>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6 pt-4">
          <h1 className="text-2xl font-black text-[#F2D7D3] font-serif">🎉 Panel Admin</h1>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide">
          {[
            { key: 'users', label: `Usuarios (${users.length})` },
            { key: 'rewards', label: `Rewards (${rewards.length})` },
            { key: 'checkpoints', label: `Checkpoints (${checkpoints.length})` },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as typeof tab)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition ${
                tab === t.key
                  ? 'metallic-rose-gold text-[#0A0A0A]'
                  : 'bg-white/5 text-[#F2D7D3]/70 hover:bg-white/10'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {deleted ? (
          <div className="text-center py-16 space-y-3">
            <div className="text-5xl">🧹</div>
            <p className="text-xl font-bold text-[#F2D7D3]">Todos los datos eliminados</p>
            <p className="text-[#B76E79]/50">¡Hasta la próxima!</p>
          </div>
        ) : tab === 'users' ? (
          <>
            <div className="space-y-3 mb-8">
              {users.map((u) => (
                <div
                  key={u.id}
                  className="card-border rounded-2xl p-4 flex items-center gap-4"
                >
                  {u.photo_url ? (
                    <img
                      src={u.photo_url}
                      alt={u.name}
                      className="w-12 h-12 rounded-full object-cover border border-[#2B1F2A]"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[#2B1F2A] flex items-center justify-center text-xl">
                      🙂
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-white">{u.name}</p>
                    <p className="text-sm text-[#B76E79]/50">{u.phone}</p>
                  </div>
                  <span className="ml-auto text-xs text-[#B76E79]/30">
                    {new Date(u.created_at).toLocaleTimeString('es', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={deleteAll}
              disabled={deleting}
              className="w-full py-4 rounded-2xl font-bold bg-red-800 hover:bg-red-700 disabled:opacity-50 transition text-white"
            >
              {deleting ? 'Eliminando...' : '🗑️ Finalizar Evento y Borrar Todos los Datos'}
            </button>
          </>
        ) : tab === 'rewards' ? (
          <div className="space-y-6">
            <form onSubmit={createReward} className="card-border rounded-2xl p-5 space-y-4">
              <h2 className="font-serif text-lg text-[#F2D7D3]">Crear reward</h2>
              <input name="title" placeholder="Título" required className="w-full px-4 py-3 rounded-xl bg-[#0A0A0A] border border-[#2B1F2A] focus:border-[#B76E79]/50 outline-none text-[#F4EADE] placeholder-[#B76E79]/30" />
              <textarea name="description" placeholder="Descripción" rows={2} className="w-full px-4 py-3 rounded-xl bg-[#0A0A0A] border border-[#2B1F2A] focus:border-[#B76E79]/50 outline-none text-[#F4EADE] placeholder-[#B76E79]/30" />
              <select name="type" required className="w-full px-4 py-3 rounded-xl bg-[#0A0A0A] border border-[#2B1F2A] focus:border-[#B76E79]/50 outline-none text-[#F4EADE]">
                <option value="">Tipo</option>
                {REWARD_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              <div className="grid grid-cols-2 gap-3">
                <input name="code" placeholder="Código (auto si vacío)" className="w-full px-4 py-3 rounded-xl bg-[#0A0A0A] border border-[#2B1F2A] focus:border-[#B76E79]/50 outline-none text-[#F4EADE] placeholder-[#B76E79]/30" />
                <input name="quantity_total" type="number" placeholder="Stock total" className="w-full px-4 py-3 rounded-xl bg-[#0A0A0A] border border-[#2B1F2A] focus:border-[#B76E79]/50 outline-none text-[#F4EADE] placeholder-[#B76E79]/30" />
              </div>
              <input name="partner_name" placeholder="Partner" className="w-full px-4 py-3 rounded-xl bg-[#0A0A0A] border border-[#2B1F2A] focus:border-[#B76E79]/50 outline-none text-[#F4EADE] placeholder-[#B76E79]/30" />
              <input name="partner_logo_url" placeholder="URL logo partner" className="w-full px-4 py-3 rounded-xl bg-[#0A0A0A] border border-[#2B1F2A] focus:border-[#B76E79]/50 outline-none text-[#F4EADE] placeholder-[#B76E79]/30" />
              <input name="image_url" placeholder="URL imagen" className="w-full px-4 py-3 rounded-xl bg-[#0A0A0A] border border-[#2B1F2A] focus:border-[#B76E79]/50 outline-none text-[#F4EADE] placeholder-[#B76E79]/30" />
              <div className="grid grid-cols-2 gap-3">
                <input name="starts_at" type="datetime-local" placeholder="Inicio" className="w-full px-4 py-3 rounded-xl bg-[#0A0A0A] border border-[#2B1F2A] focus:border-[#B76E79]/50 outline-none text-[#F4EADE] placeholder-[#B76E79]/30" />
                <input name="expires_at" type="datetime-local" placeholder="Caducidad" className="w-full px-4 py-3 rounded-xl bg-[#0A0A0A] border border-[#2B1F2A] focus:border-[#B76E79]/50 outline-none text-[#F4EADE] placeholder-[#B76E79]/30" />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 rounded-xl metallic-rose-gold text-[#0A0A0A] font-bold disabled:opacity-50"
              >
                {saving ? 'Guardando...' : 'Crear reward'}
              </button>
            </form>

            <div className="space-y-3">
              {rewards.map((r) => (
                <div key={r.id} className="card-border rounded-2xl p-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-[#F4EADE]">{r.title}</p>
                    <p className="text-xs text-[#B76E79]/60">{r.type} · {r.code} · {r.is_active ? 'Activa' : 'Inactiva'}</p>
                    {r.partner_name && <p className="text-xs text-[#F2D7D3]/50">{r.partner_name}</p>}
                  </div>
                  <button
                    onClick={() => deleteReward(r.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-800/60 hover:bg-red-700 text-white"
                  >
                    Borrar
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <form onSubmit={createCheckpoint} className="card-border rounded-2xl p-5 space-y-4">
              <h2 className="font-serif text-lg text-[#F2D7D3]">Crear checkpoint</h2>
              <input name="name" placeholder="Nombre" required className="w-full px-4 py-3 rounded-xl bg-[#0A0A0A] border border-[#2B1F2A] focus:border-[#B76E79]/50 outline-none text-[#F4EADE] placeholder-[#B76E79]/30" />
              <select name="type" required className="w-full px-4 py-3 rounded-xl bg-[#0A0A0A] border border-[#2B1F2A] focus:border-[#B76E79]/50 outline-none text-[#F4EADE]">
                <option value="">Tipo</option>
                {CHECKPOINT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              <div className="grid grid-cols-2 gap-3">
                <input name="lat" type="number" step="any" placeholder="Latitud" required className="w-full px-4 py-3 rounded-xl bg-[#0A0A0A] border border-[#2B1F2A] focus:border-[#B76E79]/50 outline-none text-[#F4EADE] placeholder-[#B76E79]/30" />
                <input name="lng" type="number" step="any" placeholder="Longitud" required className="w-full px-4 py-3 rounded-xl bg-[#0A0A0A] border border-[#2B1F2A] focus:border-[#B76E79]/50 outline-none text-[#F4EADE] placeholder-[#B76E79]/30" />
              </div>
              <input name="radius_meters" type="number" placeholder="Radio (m) - 50 por defecto" className="w-full px-4 py-3 rounded-xl bg-[#0A0A0A] border border-[#2B1F2A] focus:border-[#B76E79]/50 outline-none text-[#F4EADE] placeholder-[#B76E79]/30" />
              <select name="reward_id" className="w-full px-4 py-3 rounded-xl bg-[#0A0A0A] border border-[#2B1F2A] focus:border-[#B76E79]/50 outline-none text-[#F4EADE]">
                <option value="">Sin reward asignada</option>
                {rewards.map((r) => (
                  <option key={r.id} value={r.id}>{r.title}</option>
                ))}
              </select>
              <textarea name="challenge" placeholder="Reto / instrucciones (opcional)" rows={2} className="w-full px-4 py-3 rounded-xl bg-[#0A0A0A] border border-[#2B1F2A] focus:border-[#B76E79]/50 outline-none text-[#F4EADE] placeholder-[#B76E79]/30" />
              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 rounded-xl metallic-rose-gold text-[#0A0A0A] font-bold disabled:opacity-50"
              >
                {saving ? 'Guardando...' : 'Crear checkpoint'}
              </button>
            </form>

            <div className="space-y-3">
              {checkpoints.map((c) => (
                <div key={c.id} className="card-border rounded-2xl p-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-[#F4EADE]">{c.name}</p>
                    <p className="text-xs text-[#B76E79]/60">
                      {c.type} · {c.lat.toFixed(5)}, {c.lng.toFixed(5)} · {c.radius_meters}m
                    </p>
                    {c.reward?.title && <p className="text-xs text-[#F2D7D3]/50">Reward: {c.reward.title}</p>}
                  </div>
                  <button
                    onClick={() => deleteCheckpoint(c.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-800/60 hover:bg-red-700 text-white"
                  >
                    Borrar
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
