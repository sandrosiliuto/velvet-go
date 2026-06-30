# VELVET GO ✨ — Acceso Exclusivo VIP

App para conocer gente en eventos selectos. **Swipe**, **match mutuo** y contacto directo por **WhatsApp**.

## Frase clave

**EN LA VIDA TODO SON CONTACTOS**

## Funcionalidades 100% operativas

| Funcionalidad | Estado |
|---|---|
| Registro VIP (nombre + foto + teléfono) | ✅ Funcional |
| Subida de fotos con compresión automática | ✅ Supabase Storage |
| Visualización de participantes (swipe deck) | ✅ Tarjetas con fotos reales |
| Like / No me gusta (botones + arrastre) | ✅ Persistido en DB |
| Match mutuo (lógica bidireccional) | ✅ Detección automática |
| Modal de match + botón WhatsApp | ✅ Con confeti y enlace directo |
| Panel admin (ver usuarios + borrar datos) | ✅ Ruta protegida /admin |
| Diseño VELVET | ✅ Colores, tipografías Cinzel/Inter, logo SVG |

## Cómo funciona

1. Un asistente abre la app, pone su nombre, foto y teléfono
2. Se registra en la base de datos con su foto almacenada en la nube
3. Ve a otros asistentes en formato de tarjetas (swipe)
4. Puede dar Like (♥) o Pasar (✕) — deslizando o con botones
5. Si dos personas se dan Like mutuamente → **MATCH**
6. Aparece animación de confeti + botón para chatear por WhatsApp
7. Al acabar el evento, el admin puede borrar todos los datos desde `/admin`

## Stack técnico

- **Next.js 15.3.8** (App Router, TypeScript)
- **Supabase** (PostgreSQL + Storage)
- **Tailwind CSS v4**
- **Framer Motion** (gestos de swipe)
- **canvas-confetti** (animación de match)

## Variables de entorno

Las variables ya están configuradas en `vercel.json` para despliegue automático.

Para desarrollo local, crea `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://edawyshrkzhcnofchcyz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkYXd5c2hya3poY25vZmNoY3l6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxOTcwOTksImV4cCI6MjA5NDc3MzA5OX0.MLmcZZTevxlCJaUt3jsKqMpBWUC9Rg4oOiCbfhlcpTM
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkYXd5c2hya3poY25vZmNoY3l6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTE5NzA5OSwiZXhwIjoyMDk0NzczMDk5fQ.hVJayTLHEXQPFpYI84KObvzw3uCaBmDzCGoRs1d22Ys
ADMIN_PASSWORD=velvet2026vip
```

## Despliegue en Vercel

1. Importa este repo en [vercel.com/new](https://vercel.com/new)
2. Las variables de entorno se configuran automáticamente desde `vercel.json`
3. Click en Deploy — funciona inmediatamente

## Desarrollo local

```bash
npm install
npm run dev
```

## Base de datos

Ejecuta en Supabase > SQL Editor los scripts de `sql/` en orden:

1. `001_schema.sql` — tablas `velvet_users` y `swipes`
2. `002_rls.sql` — políticas RLS
3. `003_storage.sql` — políticas del bucket `velvet-photos`

También puedes usar `sql/setup_completo.sql`.

**Nota:** el bucket `velvet-photos` debe crearse manualmente en Supabase > Storage marcando "Public bucket" = ON.

## Contraseña admin

Panel de administración: `/admin`  
Contraseña: `velvet2026vip`

---

**Nota**: Esta es una app temporal. Todos los datos se eliminan al terminar el evento desde el panel admin.
