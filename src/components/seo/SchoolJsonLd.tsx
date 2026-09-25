import { SCHOOL } from "@/lib/school";
import { getSiteSettings } from "@/lib/settings";

export async function SchoolJsonLd() {
  const s = await getSiteSettings();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: s.name,
    description:
      `Quality English-medium education from Nursery to Class 10 in ${SCHOOL.location}.`,
    address: {
      "@type": "PostalAddress",
      streetAddress: s.address,
      addressCountry: "NP",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 26.6528334,
      longitude: 87.4653822,
    },
    hasMap: s.mapLink,
    telephone: s.phone,
    email: s.email,
    sameAs: [SCHOOL.facebook],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
