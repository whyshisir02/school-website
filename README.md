# Shree Eastern View English School — Website

Marketing showcase site + admin panel for a Nursery–Class 10 school in Jhapa, Nepal.

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS · Prisma + PostgreSQL (Neon/Supabase) · NextAuth (credentials) · Cloudinary

## Quick Start

```bash
npm install
cp .env.example .env        # fill DATABASE_URL, NEXTAUTH_SECRET, Cloudinary keys
npx prisma db push          # create tables
npm run db:seed             # admin user + sample notices/gallery
npm run dev                 # http://localhost:3000
```

**Admin login:** `/admin/login` — uses `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env` (seeded).

## Structure

- `src/app/` — public pages (`/`, `/about`, `/academics`, `/notices`, `/gallery`, `/contact`)
- `src/app/admin/` — protected panel (dashboard, notices CRUD, gallery upload)
- `src/components/home|layout|admin|gallery` — UI components
- `prisma/schema.prisma` — Notice, GalleryAlbum, GalleryImage, User, Settings

## Deploy (Vercel)

1. Push to GitHub → import in Vercel.
2. Add env vars from `.env.example` (use production DB URL).
3. Connect custom domain; SSL is automatic.
4. Submit sitemap to Google Search Console.

## Notes for Next Developer

- Notices use ISR (`revalidate = 3600`) — new notices appear on home within an hour, or redeploy to force.
- Gallery images go to Cloudinary (`f_auto,q_auto`); URLs stored in Postgres.
- Admin routes protected by `src/middleware.ts` via NextAuth JWT.
