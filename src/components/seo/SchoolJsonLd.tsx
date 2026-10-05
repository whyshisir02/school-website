
import { getSiteSettings } from "@/lib/settings";

export async function SchoolJsonLd() {
  const s = await getSiteSettings();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: s.name,
    description: s.branding.description,
    address: {
      "@type": "PostalAddress",
      streetAddress: s.address,
      addressCountry: "NP",
    },
    hasMap: s.mapLink,
    telephone: s.phone,
    email: s.email,
    sameAs: [s.branding.facebook, s.branding.youtube].filter(Boolean),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
    />
  );
}
