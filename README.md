# Shree Eastern View English School — Website

Marketing showcase site + admin panel for a Nursery–Class 10 school in Nepal.

**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind CSS · Prisma + PostgreSQL (Neon/Supabase) · NextAuth (credentials) · Cloudinary

## Setup and operation

Install dependencies with `npm ci`, copy `.env.example` to a local environment file and configure the intended school services. For a new school, follow [new-school setup](docs/new-school-setup.md); for an existing installation, follow [admin access and migrations](docs/admin-access.md). The legacy demo seed is not a production initialization command.

Run `npm run dev` for local development. Admin and Super Admin both sign in at `/admin/login`.

## Structure

- `src/app/` — public pages (`/`, `/about`, `/academics`, `/notices`, `/gallery`, `/contact`)
- `src/app/admin/` — protected panel for notices, announcements, gallery, staff, settings and account management
- `src/components/home|layout|admin|gallery` — UI components
- `prisma/schema.prisma` — content, users, permissions, account setup, activity logs and media-cleanup storage

Image management is documented in [School images](docs/images.md). The [original project plan](docs/archive/original-project-plan.txt) is archived historical material, not current setup guidance.

## Deploy and recover

[Deployment and recovery guide](docs/deployment-and-recovery.md) covers Netlify configuration, encrypted database/media backups, a disposable restore drill, recovery into an empty database and school handover. `netlify.toml` checks deployment configuration before building. Publishing, schedules and off-site copies remain deliberate maintainer operations.

## Notes for Next Developer

- Notices use ISR — home (`src/app/(public)/page.tsx`) and `/notices` set `revalidate = 3600`; admin saves also call `revalidatePath` for instant updates.
- Gallery, hero, and editor photos are compressed in the browser before upload (JPEG/PNG/WebP sources up to 20 MB; longest side up to 1920 px; target 500 KB, hard ceiling 700 KB). Upload APIs reject oversized files and store the compressed original in Cloudinary. Gallery thumbnails request a bounded 640 px `f_auto,q_auto` variant; URLs stored in Postgres. Existing uploads are not recompressed. Keep full-resolution originals separately if needed for printing.
- Check the compression policy with `npx tsx --test tests/photo-compression.test.ts`.
- Admin routes protected by `src/proxy.ts` and current database role/permission checks.

## Admin and performance improvements

See [the implementation notes](docs/admin-improvements.md) for gallery pagination, settings controls, verification, and media-cleanup behavior. Apply the updated Prisma schema in each deployment environment before serving this version.

## School ownership and separate deployments

See [Admin access](docs/admin-access.md) for roles, account setup and recovery. Super Admin can manage school identity at `/admin/settings/branding`. For a new school, use [the separate-school setup guide](docs/new-school-setup.md); do not run the Eastern View demo seed on another school's database.
