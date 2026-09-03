import { SCHOOL } from "@/lib/school";

export function SchoolJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: SCHOOL.name,
    description:
      `Quality English-medium education from Nursery to Class 10 in ${SCHOOL.location}.`,
    address: {
      "@type": "PostalAddress",
      streetAddress: SCHOOL.address,
      addressCountry: "NP",
    },
    telephone: SCHOOL.phone,
    email: SCHOOL.email,
    sameAs: [SCHOOL.facebook],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
