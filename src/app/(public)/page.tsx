import Hero from "@/components/home/Hero";
import NoticeTicker from "@/components/home/NoticeTicker";
import PrincipalMessage from "@/components/home/PrincipalMessage";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import LatestNotices from "@/components/home/LatestNotices";
import GalleryPreview from "@/components/home/GalleryPreview";
import ContactCTA from "@/components/home/ContactCTA";
import { SchoolJsonLd } from "@/components/seo/SchoolJsonLd";

// ISR: home refreshes at most hourly; admin saves also trigger revalidatePath("/")
export const revalidate = 3600;

export default function HomePage() {
  return (
    <>
      <SchoolJsonLd />
      <Hero />
      <NoticeTicker />
      <PrincipalMessage />
      <WhyChooseUs />
      <LatestNotices />
      <GalleryPreview />
      <ContactCTA />
    </>
  );
}
