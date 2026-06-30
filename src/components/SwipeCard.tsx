'use client'

import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion'

export type CardUser = { id: string; name: string; photo_url: string | null }

interface Props {
  user: CardUser
  isTop: boolean
  stackDepth: number
  onLike: () => void
  onPass: () => void
}

export default function SwipeCard({ user, isTop, stackDepth, onLike, onPass }: Props) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-22, 22])
  const likeOpacity = useTransform(x, [30, 100], [0, 1])
  const passOpacity = useTransform(x, [-100, -30], [1, 0])

  function handleDragEnd(_: unknown, info: { offset: { x: number } }) {
    if (info.offset.x > 110) onLike()
    else if (info.offset.x < -110) onPass()
  }

  const scaleBack = 1 - stackDepth * 0.05
  const yBack = stackDepth * 10

  if (!isTop) {
    return (
      <div
        className="absolute inset-0 rounded-3xl"
        style={{
          background: 'linear-gradient(145deg, #2B1F2A, #0A0A0A)',
          border: '1px solid rgba(183,110,121,0.08)',
          transform: `scale(${scaleBack}) translateY(${yBack}px)`,
          zIndex: -stackDepth,
        }}
      />
    )
  }

  return (
    <AnimatePresence>
      <motion.div
        key={user.id}
        className="absolute inset-0 rounded-3xl overflow-hidden cursor-grab active:cursor-grabbing select-none"
        style={{ x, rotate, zIndex: 10 }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.9}
        onDragEnd={handleDragEnd}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.15 } }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        whileTap={{ cursor: 'grabbing' }}
      >
        <div className="relative w-full h-full swipe-card-bg"
        >
          {user.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.photo_url}
              alt={user.name}
              className="w-full h-full object-cover pointer-events-none"
              loading="eager"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3">
              <div
                className="w-28 h-28 rounded-full flex items-center justify-center text-5xl font-black"
                style={{
                  background: 'linear-gradient(135deg, rgba(183,110,121,0.15), rgba(43,31,42,0.15))',
                  border: '2px solid rgba(183,110,121,0.2)',
                  color: '#F2D7D3',
                }}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm text-[#B76E79]/50">Sin foto aún</span>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent pointer-events-none" />

          <div
            className="absolute inset-0 rounded-3xl pointer-events-none"
            style={{ border: '1px solid rgba(183,110,121,0.12)' }}
          />

          {/* Stamp LIKE */}
          <motion.div
            className="absolute top-8 left-5 font-black text-3xl px-4 py-1.5 rounded-xl"
            style={{
              opacity: likeOpacity,
              rotate: -15,
              border: '3px solid #F2D7D3',
              color: '#F2D7D3',
              textShadow: '0 0 12px rgba(242,215,211,0.5)',
            }}
          >
            LIKE
          </motion.div>

          {/* Stamp NOPE */}
          <motion.div
            className="absolute top-8 right-5 font-black text-3xl px-4 py-1.5 rounded-xl"
            style={{
              opacity: passOpacity,
              rotate: 15,
              border: '3px solid #8F404C',
              color: '#8F404C',
              textShadow: '0 0 12px rgba(143,64,76,0.5)',
            }}
          >
            NOPE
          </motion.div>

          {/* Nombre */}
          <div className="absolute bottom-0 inset-x-0 p-5 pointer-events-none">
            <h2 className="text-3xl font-black text-white drop-shadow-lg">{user.name}</h2>
            <p className="text-sm text-[#B76E79]/70 mt-0.5">Desliza para elegir →</p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
