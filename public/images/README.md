# School Images

Real school photos live here (git-versioned, served directly by Next.js).
The **dynamic gallery** (admin uploads) does NOT go here — it goes to
Cloudinary via the admin panel.

## Folder layout

```
public/images/
├── logo.png              ← school logo (used on notice letterhead + favicon)
├── og.jpg                ← 1200×630 social share image (Facebook/WhatsApp preview)
├── hero-main.jpg         ← homepage hero: school building / students
├── hero-1.jpg            ← homepage hero small photo 1
├── hero-2.jpg            ← homepage hero small photo 2
└── staff/
    ├── jb-magar.jpg      ← principal photo (square, ≥400×400)
    └── <slug>.jpg        ← one file per staff member, filename = their slug
```

## How to manage staff (no code changes needed for photos)

The staff list lives in **`src/lib/staff.ts`** — one line per person:

```ts
{ slug: "sita-sharma", name: "Sita Sharma", role: "Teacher", subject: "English" },
```

To give someone a photo, just drop a file named `<slug>.jpg` (or `.webp` /
`.png`) into `staff/` — the site picks it up automatically. Remove the file
and their card falls back to a clean initials avatar. No code change either way.

To add/remove a person, add/delete their line in `STAFF` in
`src/lib/staff.ts` — the About page and homepage update automatically.

> Note: photo detection happens at build time, so after changing files in
> `staff/`, run `npm run build` (or restart `npm run dev`) to see changes.

## Rules

- **Only real, confirmed people.** Never stock photos of strangers as staff.
- Keep files under ~300 KB (compress before committing: tinypng.com etc.).
- Filenames: lowercase, hyphens (`jb-magar.jpg`, not `JB Magar.JPG`), and must
  match the person's `slug` in `staff.ts` exactly.
