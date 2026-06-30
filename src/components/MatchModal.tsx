'use client'

import { useEffect } from 'react'
import confetti from 'canvas-confetti'

interface MatchedUser {
  id: string
  name: string
  photo_url: string | null
  phone: string
}

export default function MatchModal({
  matchedUser,
  onClose,
}: {
  matchedUser: MatchedUser
  onClose: () => void
}) {
  useEffect(() => {
    const end = Date.now() + 2500
    const colors = ['#B76E79', '#F2D7D3', '#8F404C', '#F4EADE', '#2B1F2A']
    const frame = () => {
      confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors })
      confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors })
      if (Date.now() < end) requestAnimationFrame(frame)
    }
    frame()
  }, [])

  const cleanPhone = matchedUser.phone.replace(/[\s\-()]/g, '')
  const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    `¡Hola ${matchedUser.name}! Hemos hecho match en VELVET GO ✨🥂`,
  )}`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md px-4">
      <div
        className="w-full max-w-sm rounded-3xl p-8 text-center space-y-5"
        style={{
          background: 'linear-gradient(145deg, #2B1F2A, #0A0A0A)',
          border: '1px solid rgba(183,110,121,0.25)',
          boxShadow: '0 0 60px rgba(183,110,121,0.1), 0 0 40px rgba(242,215,211,0.08)',
        }}
      >
        <div className="text-5xl animate-bounce">✨</div>

        <h1
          className="text-4xl font-black font-serif"
          style={{
            background: 'linear-gradient(135deg, #B76E79, #F2D7D3)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          ¡Match!
        </h1>

        <div className="flex justify-center">
          {matchedUser.photo_url ? (
            <img
              src={matchedUser.photo_url}
              alt={matchedUser.name}
              className="w-28 h-28 rounded-full object-cover border-4"
              style={{ borderColor: '#B76E79', boxShadow: '0 0 20px rgba(183,110,121,0.3)' }}
            />
          ) : (
            <div
              className="w-28 h-28 rounded-full flex items-center justify-center text-5xl font-black border-4"
              style={{
                background: 'linear-gradient(135deg, rgba(183,110,121,0.15), rgba(43,31,42,0.15))',
                borderColor: '#B76E79',
                color: '#B76E79',
              }}
            >
              {matchedUser.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <p className="text-lg text-white">
          ¡A ti y a{' '}
          <span className="font-black" style={{ color: '#F2D7D3' }}>
            {matchedUser.name}
          </span>{' '}
          os gustáis! ✨
        </p>

        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-black text-white text-lg transition hover:opacity-90 hover:scale-105 active:scale-95"
          style={{ background: '#25D366', boxShadow: '0 4px 20px rgba(37,211,102,0.3)' }}
        >
          💬 Chatear por WhatsApp
        </a>

        <button
          onClick={onClose}
          className="text-sm text-white/40 hover:text-[#F2D7D3] transition"
        >
          Seguir conociendo gente ✨→
        </button>
      </div>
    </div>
  )
}
