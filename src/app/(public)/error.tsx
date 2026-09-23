"use client";

import { useEffect } from "react";
import Link from "next/link";
import { FiRefreshCw, FiHome } from "react-icons/fi";

/**
 * Error boundary for public pages. Sibling to not-found.tsx but for a different
 * failure: this fires when a page THROWS (most likely /notices and / when the
 * database is unreachable), not when a page is missing.
 *
 * The distinction matters for the school: without this, a DB hiccup shows every
 * visitor Next's raw runtime error screen. With it, they get a branded page and
 * a retry button, and the visitor still has the navbar and footer to navigate
 * with — Next keeps the surrounding layout mounted.
 */
export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surfaces in the server logs / Vercel function logs — the digest is what
    // ties this client-side report to the matching server stack trace.
    console.error("Public page error:", error);
  }, [error]);

  return (
    <section className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gold/10 text-gold-dark">
        <FiRefreshCw size={26} />
      </div>

      <h1 className="mt-6 font-heading text-2xl font-bold text-navy sm:text-3xl">
        Something went wrong on our end
      </h1>
      <p className="mt-4 max-w-md text-slate-600">
        This page couldn&apos;t load. It&apos;s usually temporary — please try again,
        and if it keeps happening let us know so we can fix it.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button onClick={reset} className="btn-primary">
          <FiRefreshCw size={16} /> Try Again
        </button>
        <Link href="/" className="btn-outline">
          <FiHome size={16} /> Back to Home
        </Link>
      </div>

      {error.digest && (
        <p className="mt-8 text-xs text-slate-400">
          Reference code: <span className="font-mono">{error.digest}</span>
        </p>
      )}
    </section>
  );
}