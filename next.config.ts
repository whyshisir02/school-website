import type { NextConfig } from "next";

// Content-Security-Policy. Applied in production only: `next dev` relies on
// eval for React Fast Refresh, which a strict script-src would break. We use
// 'unsafe-inline' for scripts/styles because Next injects inline hydration
// scripts and we don't run a nonce middleware — still a real improvement over
// no CSP (locks down object/base/frame-ancestors and the allowed origins).
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob: https://res.cloudinary.com https://images.unsplash.com",
  // Google Maps location embed on the contact page.
  "frame-src https://www.google.com https://maps.google.com",
  "connect-src 'self'",
  "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
  // Bundle the logo into the serverless functions that read it from disk
  // (favicon/apple-icon/OG image via lib/brand-assets, and the notice
  // letterhead). On Netlify the public/ folder is served from the CDN but is
  // NOT present in the function filesystem, so without this the
  // readFileSync(process.cwd()/public/images/logo.png) call fails in
  // production and the tab icon falls back to the "EV" monogram.
  outputFileTracingIncludes: {
    "/**": ["./public/images/logo.png"],
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  async headers() {
    const securityHeaders = [
      { key: "X-Frame-Options", value: "DENY" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
    ];
    if (process.env.NODE_ENV === "production") {
      securityHeaders.push({ key: "Content-Security-Policy", value: csp });
    }
    return [
      {
        // Applies everywhere, incl. /admin — blocks the site (and the admin
        // login form) from being embedded in another site's iframe, which is
        // the standard setup for clickjacking / credential-overlay attacks.
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
