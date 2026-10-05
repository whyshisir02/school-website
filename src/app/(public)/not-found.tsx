import NotFoundBody from "@/components/NotFoundBody";

/**
 * Handles notFound() thrown inside a public page — most importantly a bad or
 * unpublished /notices/[slug], which is the likeliest 404 a real visitor hits
 * (shared notice links outlive the notice itself).
 *
 * This file sits inside the (public) route group, so TopBar/Navbar/Footer come
 * from app/(public)/layout.tsx automatically.
 */
export default function NotFound() {
  return <NotFoundBody />;
}