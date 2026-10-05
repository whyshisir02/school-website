import TopBar from "@/components/layout/TopBar";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getSiteSettings } from "@/lib/settings";
import VisitAnnouncement from "@/components/VisitAnnouncement";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();
  return (
    <>
      <TopBar />
      <Navbar branding={settings.branding} name={settings.name} phone={settings.phone} email={settings.email} />
      <main>{children}</main>
      <Footer />
      <VisitAnnouncement />
    </>
  );
}
