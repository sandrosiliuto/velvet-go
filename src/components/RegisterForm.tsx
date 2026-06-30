'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { compressImage } from '@/lib/compressImage'

export default function RegisterForm() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  function isValidSpanishPhone(p: string): boolean {
    const digits = p.replace(/\s/g, '')
    return /^[67]\d{8}$/.test(digits)
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const compressed = await compressImage(file, { maxSize: 800, quality: 0.82 })
      const compressedFile = new File([compressed], 'photo.jpg', { type: 'image/jpeg' })
      setPhoto(compressedFile)
      setPreview(URL.createObjectURL(compressed))
    } catch {
      setPhoto(file)
      setPreview(URL.createObjectURL(file))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!agreed) { setError('Acepta los términos para continuar'); return }

    const cleanPhone = phone.replace(/\s/g, '')
    if (!isValidSpanishPhone(cleanPhone)) {
      setError('Introduce un número válido de 9 dígitos (empieza por 6 o 7)')
      return
    }

    setLoading(true)
    setError('')

    try {
      const fd = new FormData()
      fd.append('name', name)
      fd.append('phone', `+34${cleanPhone}`)
      if (photo) fd.append('photo', photo)

      const res = await fetch('/api/register', { method: 'POST', body: fd, credentials: 'include' })

      if (!res.ok) {
        let message = `Error del servidor (${res.status})`
        try {
          const data = await res.json()
          message = data.error ?? message
        } catch { }
        setError(message)
        setLoading(false)
        return
      }

      router.push('/discover')
    } catch (err) {
      console.error('Register error:', err)
      setError('Error de conexión. Comprueba tu internet e inténtalo de nuevo.')
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full space-y-4 rounded-3xl p-6 velvet-glass border border-[#B76E79]/15 shadow-2xl"
    >
      {/* Foto */}
      <div className="flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-dashed border-[#B76E79]/40 hover:border-[#B76E79]/70 transition flex items-center justify-center bg-white/5"
        >
          {preview ? (
            <img src={preview} alt="foto" className="w-full h-full object-cover" />
          ) : (
            <span className="text-3xl">📷</span>
          )}
        </button>
        <span className="text-xs text-[#F2D7D3]/70">Toca para agregar tu foto</span>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="user"
          className="hidden"
          onChange={handlePhotoChange}
        />
      </div>

      {/* Nombre */}
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Tu nombre"
        required
        maxLength={30}
        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-[#B76E79]/50 outline-none transition placeholder-[#F2D7D3]/40 text-[#F4EADE]"
      />

      {/* Teléfono */}
      <div>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#F2D7D3]/50 text-sm select-none">🇪🇸</span>
          <input
            type="tel"
            value={phone}
            onChange={(e) => {
              const val = e.target.value.replace(/[^\d\s]/g, '')
              if (val.replace(/\s/g, '').length <= 9) setPhone(val)
            }}
            placeholder="612 345 678"
            required
            inputMode="numeric"
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-[#B76E79]/50 outline-none transition placeholder-[#F2D7D3]/40 text-[#F4EADE]"
          />
        </div>
        <p className="text-[11px] text-[#F2D7D3]/50 mt-1 ml-1">
          Solo 9 dígitos · Se comparte solo si hay match
        </p>
      </div>

      {/* Términos */}
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5 w-4 h-4 accent-[#B76E79] rounded"
        />
        <span className="text-[11px] text-[#F2D7D3]/80 leading-tight">
          Entiendo que mis datos se usan solo durante el evento y se eliminan después.
        </span>
      </label>

      {/* Error */}
      {error && (
        <p className="text-red-300 text-sm bg-red-500/15 border border-red-500/30 rounded-xl px-4 py-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading || !name || !phone || !agreed}
        className="w-full py-4 rounded-2xl metallic-rose-gold text-[#0A0A0A] font-semibold tracking-widest uppercase text-sm shadow-lg disabled:opacity-50 transition-all duration-300"
      >
        {loading ? '⏳ Entrando...' : 'Entrar'}
      </button>
    </form>
  )
}
