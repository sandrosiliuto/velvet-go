'use client'

import { useState, useCallback } from 'react'
import SwipeCard, { type CardUser } from './SwipeCard'
import MatchModal from './MatchModal'

interface MatchedUser {
  id: string
  name: string
  photo_url: string | null
  phone: string
}

const DEMO_MATCH: MatchedUser = {
  id: 'demo-match',
  name: 'Sofía',
  photo_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sofia&backgroundColor=ff00c8',
  phone: '+34600000000',
}

export default function SwipeDeck({
  users,
  currentUserId,
  isDemo = false,
}: {
  users: CardUser[]
  currentUserId: string
  isDemo?: boolean
}) {
  const [index, setIndex] = useState(0)
  const [matchData, setMatchData] = useState<MatchedUser | null>(null)
  const [demoLikes, setDemoLikes] = useState(0)
  const [reloading, setReloading] = useState(false)

  const handleSwipe = useCallback(
    async (liked: boolean) => {
      const user = users[index]
      if (!user) return

      setIndex((i) => i + 1)

      // DEMO MODE
      if (isDemo && liked) {
        setDemoLikes((prev) => {
          const next = prev + 1
          if (next === 2) {
            setTimeout(() => setMatchData(DEMO_MATCH), 400)
          }
          return next
        })
        return
      }

      if (liked) {
        try {
          const res = await fetch('/api/swipe', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ swiperId: currentUserId, swipedId: user.id, liked: true }),
          })
          const data = await res.json()
          if (data.matched) setMatchData(data.matchedUser)
        } catch (err) {
          console.error('swipe error', err)
        }
      } else {
        fetch('/api/swipe', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ swiperId: currentUserId, swipedId: user.id, liked: false }),
        }).catch(console.error)
      }
    },
    [index, users, currentUserId, isDemo],
  )

  // Recargar rechazados — borra swipes con liked=false y recarga la página
  async function handleReloadRejected() {
    if (isDemo) {
      // En demo, simplemente reinicia el índice
      setIndex(0)
      return
    }

    setReloading(true)
    try {
      const res = await fetch('/api/swipe', {
        method: 'DELETE',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ swiperId: currentUserId }),
      })
      if (res.ok) {
        // Recargar la página para obtener los perfiles actualizados del servidor
        window.location.reload()
      }
    } catch (err) {
      console.error('reload error', err)
    }
    setReloading(false)
  }

  const visible = users.slice(index, index + 3)
  const remaining = users.length - index

  // Cuando no quedan perfiles por ver
  if (index >= users.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-8 space-y-5">
        <div className="text-6xl">✨</div>
        <h2 className="text-2xl font-black text-[#F2D7D3]">¡Has visto a todos!</h2>
        <p className="text-[#B76E79]/70 text-sm">
          ¿Quieres darle otra oportunidad a los que rechazaste?
        </p>

        {/* Botón RECARGAR RECHAZADOS */}
        <button
          onClick={handleReloadRejected}
          disabled={reloading}
          className="px-6 py-3 rounded-2xl font-bold text-[#0A0A0A] transition hover:opacity-90 active:scale-95 disabled:opacity-50 metallic-rose-gold"
        >
          {reloading ? '⏳ Recargando...' : '🔄 Ver de nuevo'}
        </button>

        <p className="text-xs text-[#B76E79]/40">
          Solo se reinician los rechazados — tus likes se mantienen intactos
        </p>

        {isDemo && (
          <p className="text-[#F2D7D3] text-xs mt-2 bg-[#B76E79]/10 border border-[#B76E79]/30 rounded-xl px-4 py-2">
            ⚡ Modo demo
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center h-full gap-5 px-4">
      {/* Contador */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-[#B76E79]/60">
          {remaining} {remaining === 1 ? 'persona' : 'personas'} por conocer
        </span>
      </div>

      {/* Card stack */}
      <div
        className="relative"
        style={{ width: 'min(380px, 90vw)', height: 'min(500px, 60vh)' }}
      >
        {[...visible].reverse().map((user, revIdx) => {
          const depth = visible.length - 1 - revIdx
          return (
            <SwipeCard
              key={user.id}
              user={user}
              isTop={depth === 0}
              stackDepth={depth}
              onLike={() => handleSwipe(true)}
              onPass={() => handleSwipe(false)}
            />
          )
        })}
      </div>

      {/* Botones de acción */}
      <div className="flex items-center gap-10">
        <button
          onClick={() => handleSwipe(false)}
          aria-label="No me gusta"
          className="w-16 h-16 rounded-full flex items-center justify-center text-2xl border-2 border-[#8F404C]/70 hover:border-[#8F404C] hover:scale-110 hover:bg-[#8F404C]/10 transition-all bg-[#0A0A0A] text-[#8F404C]"
        >
          ✕
        </button>

        <button
          onClick={() => handleSwipe(true)}
          aria-label="Me gusta"
          className="w-20 h-20 rounded-full flex items-center justify-center text-4xl border-2 hover:scale-110 transition-all metallic-rose-gold text-[#0A0A0A] border-[#F2D7D3]/50"
        >
          ♥
        </button>

        <button
          onClick={() => handleSwipe(false)}
          aria-label="Siguiente"
          className="w-16 h-16 rounded-full flex items-center justify-center text-xl border-2 border-[#2B1F2A] hover:border-[#B76E79]/40 hover:scale-110 transition-all bg-[#0A0A0A] text-[#B76E79]/50"
        >
          →
        </button>
      </div>

      <p className="text-xs text-[#B76E79]/40">Desliza la tarjeta o usa los botones</p>

      {matchData && (
        <MatchModal matchedUser={matchData} onClose={() => setMatchData(null)} />
      )}
    </div>
  )
}
