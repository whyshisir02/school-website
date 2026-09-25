import { FiPhone, FiMail } from "react-icons/fi";
import { SiFacebook } from "react-icons/si";
import { SCHOOL } from "@/lib/school";
import { getSiteSettings } from "@/lib/settings";

export default async function TopBar() {
  const s = await getSiteSettings();
  return (
    <div className="bg-navy text-white print:hidden">
      <div className="container-page flex h-8 items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          <a href={`tel:${s.phone}`} className="flex items-center gap-1.5 hover:text-gold">
            <FiPhone size={12} /> {s.phone}
          </a>
          <a href={`mailto:${s.email}`} className="hidden items-center gap-1.5 hover:text-gold sm:flex">
            <FiMail size={12} /> {s.email}
          </a>
        </div>
        <a href={SCHOOL.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-gold" aria-label="Facebook">
          <SiFacebook size={14} />
        </a>
      </div>
    </div>
  );
}
