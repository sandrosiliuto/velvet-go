# JAMBOO Fiesta — Checklist de Implementación

## Infraestructura
- [x] Next.js 15.3.8 (App Router, TypeScript)
- [x] Supabase (DB + Storage, sin auth compleja)
- [x] Tailwind CSS v4
- [x] Framer Motion (gestos swipe)
- [x] canvas-confetti (animación match)

## Base de datos Supabase (ejecutar en SQL Editor)
- [ ] `sql/001_schema.sql` — tablas `velvet_users` y `swipes`
- [ ] `sql/002_rls.sql` — políticas RLS (nunca exponer el teléfono)
- [ ] `sql/003_storage.sql` — bucket `velvet-photos` público

## Variables de entorno (Vercel + .env.local)
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `ADMIN_PASSWORD` (contraseña del panel /admin)

## Pantallas
- [x] `/` — Registro ultrarrápido (nombre, foto, WhatsApp)
- [x] `/discover` — Deck de swipe estilo Tinder
- [x] `/admin` — Panel del organizador (protegido por contraseña)

## Funcionalidades
- [x] Registro con foto (compresión client-side)
- [x] Swipe derecha = Like / izquierda = Pass (Framer Motion)
- [x] Botones táctiles Like / Pass
- [x] Detección de match mutuo en el servidor
- [x] Modal de match con confeti + botón WhatsApp
- [x] Panel admin: lista de usuarios + borrar todo
- [x] Cookie `velvet_user_id` (8 h) — sesión sin contraseña

## Eliminado (no está en el nuevo código)
- [x] Sistema de chat interno
- [x] Onboarding con preferencias
- [x] Verificación de selfie
- [x] Múltiples fotos
- [x] Login por magic link / email
- [x] Likes en galería de fotos
- [x] Perfil de Instagram obligatorio
- [x] Algoritmo de recomendación complejo
