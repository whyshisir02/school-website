import Hero from "@/components/home/Hero";
import NoticeTicker from "@/components/home/NoticeTicker";
import PrincipalMessage from "@/components/home/PrincipalMessage";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import LatestNotices from "@/components/home/LatestNotices";
import GalleryPreview from "@/components/home/GalleryPreview";
import ContactCTA from "@/components/home/ContactCTA";
import { SchoolJsonLd } from "@/components/seo/SchoolJsonLd";
import { getSiteSettings } from "@/lib/settings";

// ISR: home refreshes at most hourly; admin saves also trigger revalidatePath("/")
export const revalidate = 3600;

export default async function HomePage() {
  const s = await getSiteSettings();
  return (
    <>
      <SchoolJsonLd />
      <Hero />
      <NoticeTicker />
      <PrincipalMessage />
      <WhyChooseUs />
      <LatestNotices />
      <GalleryPreview />
      <ContactCTA
        address={s.address}
        phone={s.phone}
        email={s.email}
        mapEmbed={s.mapEmbed}
      />
    </>
  );
}
