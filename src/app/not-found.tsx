import TopBar from "@/components/layout/TopBar";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import NotFoundBody from "@/components/NotFoundBody";

/**
 * Catches URLs that match no route at all (e.g. /notces). Next renders this
 * WITHOUT the (public) route-group layout, so this file has to bring its own
 * TopBar/Navbar/Footer — otherwise a mistyped URL lands the visitor on a
 * chrome-less page with no way back into the site.
 *
 * notFound() thrown from inside a public page is handled by
 * app/(public)/not-found.tsx instead, which reuses the group layout.
 */
export default function NotFound() {
  return (
    <>
      <TopBar />
      <Navbar />
      <main>
        <NotFoundBody />
      </main>
      <Footer />
    </>
  );
}