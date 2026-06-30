import RegisterForm from '@/components/RegisterForm'

export const dynamic = 'force-dynamic'

export default function HomePage() {
  return (
    <main className="relative min-h-[100dvh] flex flex-col overflow-hidden velvet-radial">
      {/* VIP Header */}
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
          <div className="flex items-center gap-2">
            <span className="vip-badge text-[10px] font-semibold tracking-widest">VIP</span>
            <span className="text-[10px] text-[#F2D7D3]/70 tracking-wide hidden sm:inline">ACCESO EXCLUSIVO</span>
          </div>
        </div>
      </header>

      {/* Contenido */}
      <div className="relative z-10 flex flex-col items-center justify-end min-h-[100dvh] px-5 pb-8 pt-28">
        {/* LOGO animado */}
        <div className="text-center mb-5 animate-fade-in-bounce">
          <div className="relative w-28 h-28 mx-auto mb-4 animate-float">
            <div className="absolute inset-0 rounded-full bg-[#B76E79]/20 blur-2xl"></div>
            <svg viewBox="0 0 400 460" className="w-full h-full drop-shadow-[0_0_24px_rgba(183,110,121,0.45)]" aria-label="Isotipo VELVET">
              <defs>
                <linearGradient id="roseGoldIso" x1="0" y1="0" x2="400" y2="460" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#8F404C" />
                  <stop offset="25%" stopColor="#B76E79" />
                  <stop offset="50%" stopColor="#F2D7D3" />
                  <stop offset="75%" stopColor="#B76E79" />
                  <stop offset="100%" stopColor="#8F404C" />
                </linearGradient>
                <linearGradient id="roseGoldStroke" x1="0" y1="0" x2="400" y2="460" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#B76E79" />
                  <stop offset="50%" stopColor="#F2D7D3" />
                  <stop offset="100%" stopColor="#B76E79" />
                </linearGradient>
              </defs>
              <path d="M55 50 L200 400 L345 50 L295 50 L200 310 L105 50 Z" fill="url(#roseGoldIso)" opacity="0.95" />
              <path d="M138 72 C115 82 100 110 96 150 C93 190 105 230 128 260 C145 283 168 300 195 315 L200 318 L200 362 L150 325 C120 300 98 265 90 225 C82 185 88 140 108 105 C118 87 130 76 138 72 Z" fill="none" stroke="url(#roseGoldStroke)" strokeWidth="4.5" opacity="0.95" />
              <path d="M138 72 C142 95 145 120 140 145 C138 158 132 168 122 175 C118 178 114 180 110 181" fill="none" stroke="url(#roseGoldStroke)" strokeWidth="3.5" opacity="0.9" />
              <path d="M262 72 C285 82 300 110 304 150 C307 190 295 230 272 260 C255 283 232 300 205 315 L200 318 L200 362 L250 325 C280 300 302 265 310 225 C318 185 312 140 292 105 C282 87 270 76 262 72 Z" fill="none" stroke="url(#roseGoldStroke)" strokeWidth="4.5" opacity="0.95" />
              <path d="M262 72 C258 95 255 120 260 145 C262 158 268 168 278 175 C282 178 286 180 290 181" fill="none" stroke="url(#roseGoldStroke)" strokeWidth="3.5" opacity="0.9" />
              <g transform="translate(200,232)" className="sparkle">
                <path d="M0 -44 L9 -9 L44 0 L9 9 L0 44 L-9 9 L-44 0 L-9 -9 Z" fill="#F4EADE" />
                <circle cx="0" cy="0" r="9" fill="url(#roseGoldIso)" />
              </g>
            </svg>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-wide text-[#F4EADE] mb-1">
            VELVET
          </h1>
          <p className="text-[#B76E79] text-sm tracking-[0.3em] uppercase mb-2">contactos</p>
          <p className="text-[#F2D7D3]/80 text-sm italic mb-6">EN LA VIDA TODO SON CONTACTOS</p>
        </div>

        {/* Formulario */}
        <div className="w-full max-w-sm">
          <RegisterForm />
        </div>

        <p className="mt-4 text-[10px] text-[#F2D7D3]/40 text-center">
          Tus datos solo se usan hoy y se eliminan al terminar
        </p>
      </div>
    </main>
  )
}
