/**
 * Shown while a public page's server component resolves. /notices, /gallery
 * and / all hit the database, so on a cold cache (or a slow Neon/Supabase
 * connection) there is a real gap between the navbar painting and the content
 * arriving. Without this, the page looks frozen.
 *
 * The spinner is intentionally plain — this is a skeleton, not content, and a
 * layout that mimics the real page would only flicker.
 */
export default function PublicLoading() {
  return (
    <div className="container-page flex min-h-[50vh] items-center justify-center py-20">
      <div className="flex flex-col items-center gap-4">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-gold"
          role="status"
          aria-label="Loading"
        />
        <p className="text-sm text-slate-500">Loading…</p>
      </div>
    </div>
  );
}