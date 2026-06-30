import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase-server'
import SwipeDeck from '@/components/SwipeDeck'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const DEMO_USERS = [
  { id: 'demo-p1', name: 'Cristina', photo_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Cristina&backgroundColor=B76E79' },
  { id: 'demo-p2', name: 'Andrés', photo_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Andres&backgroundColor=2B1F2A' },
  { id: 'demo-p3', name: 'Lucía', photo_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lucia&backgroundColor=F2D7D3' },
  { id: 'demo-p4', name: 'Mateo', photo_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mateo&backgroundColor=8F404C' },
  { id: 'demo-p5', name: 'Sofía', photo_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sofia&backgroundColor=B76E79' },
]

export default async function DiscoverPage() {
  const cookieStore = await cookies()
  const currentUserId = cookieStore.get('velvet_user_id')?.value
  if (!currentUserId) redirect('/')

  const isDemoMode =
    !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY

  if (isDemoMode) {
    const myName = cookieStore.get('velvet_user_name')?.value ?? 'tú'
    return (
      <div className="relative h-screen flex flex-col overflow-hidden velvet-radial">
        <header className="fixed top-0 inset-x-0 z-50 h-14 velvet-glass border-b border-white/5">
          <div className="max-w-md mx-auto h-full px-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg width="22" height="22" viewBox="0 0 200 200" fill="none" aria-hidden="true" className="sparkle">
                <path d="M100 10 L112 88 L190 100 L112 112 L100 190 L88 112 L10 100 L88 88 Z" fill="url(#roseGoldHeader)" />
                <defs>
                  <linearGradient id="roseGoldHeader" x1="0" y1="0" x2="200" y2="200">
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
            <div className="flex items-center gap-3">
              <span className="text-sm text-[#F2D7D3]/70">Hola, {myName} ✨</span>
              <span className="vip-badge text-[10px]">⚡ Demo</span>
            </div>
          </div>
        </header>
        <div className="relative z-10 flex-1 overflow-hidden pt-14">
          <SwipeDeck users={DEMO_USERS} currentUserId={currentUserId} isDemo />
        </div>
        <Link
          href="/rewards/map"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-full metallic-rose-gold text-[#0A0A0A] text-sm font-bold shadow-lg shadow-[#B76E79]/20 hover:shadow-[#B76E79]/30 transition"
        >
          <span>🎁</span>
          <span>Rewards VIP</span>
        </Link>
      </div>
    )
  }

  const supabase = createServiceClient()

  const { data: swipes } = await supabase
    .from('swipes')
    .select('swiped_id, liked')
    .eq('swiper_id', currentUserId)

  const likedIds = (swipes ?? []).filter((s) => s.liked).map((s) => s.swiped_id)

  let query = supabase
    .from('velvet_users')
    .select('id, name, photo_url')
    .neq('id', currentUserId)
    .order('created_at', { ascending: false })

  if (likedIds.length > 0) {
    query = query.not('id', 'in', `(${likedIds.join(',')})`)
  }

  const { data: users } = await query

  const { data: me } = await supabase
    .from('velvet_users')
    .select('name')
    .eq('id', currentUserId)
    .single()

  return (
    <div className="relative h-screen flex flex-col overflow-hidden velvet-radial">
      <header className="fixed top-0 inset-x-0 z-50 h-14 velvet-glass border-b border-white/5">
        <div className="max-w-md mx-auto h-full px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg width="22" height="22" viewBox="0 0 200 200" fill="none" aria-hidden="true" className="sparkle">
              <path d="M100 10 L112 88 L190 100 L112 112 L100 190 L88 112 L10 100 L88 88 Z" fill="url(#roseGoldHeader2)" />
              <defs>
                <linearGradient id="roseGoldHeader2" x1="0" y1="0" x2="200" y2="200">
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
          <div className="flex items-center gap-3">
            <span className="text-sm text-[#F2D7D3]/70">Hola, {me?.name ?? '...'} ✨</span>
            <form action="/api/logout" method="post">
              <button className="text-xs text-[#F2D7D3]/50 hover:text-[#F4EADE] transition">
                Salir
              </button>
            </form>
          </div>
        </div>
      </header>
      <div className="relative z-10 flex-1 overflow-hidden pt-14">
        <SwipeDeck users={users ?? []} currentUserId={currentUserId} />
      </div>
      <Link
        href="/rewards/map"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-full metallic-rose-gold text-[#0A0A0A] text-sm font-bold shadow-lg shadow-[#B76E79]/20 hover:shadow-[#B76E79]/30 transition"
      >
        <span>🎁</span>
        <span>Rewards VIP</span>
      </Link>
    </div>
  )
}
