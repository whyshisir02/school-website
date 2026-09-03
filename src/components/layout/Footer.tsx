import Link from "next/link";
import { FiMapPin, FiPhone, FiMail, FiClock } from "react-icons/fi";
import { SiFacebook, SiYoutube } from "react-icons/si";
import { SCHOOL } from "@/lib/school";

const quickLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/academics", label: "Academics" },
  { href: "/notices", label: "Notices" },
  { href: "/gallery", label: "Gallery" },
];

export default function Footer() {
  return (
    <footer className="bg-navy text-slate-300">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        {/* Col 1 */}
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 font-heading text-lg font-bold text-gold">
              EV
            </div>
            <div className="font-heading text-lg font-bold text-white">Shree Eastern View</div>
          </div>
          <p className="mt-4 text-sm leading-relaxed">
            Nurturing minds from Nursery to Class 10 with quality education, character, and care in {SCHOOL.location}.
          </p>
          <div className="mt-4 flex gap-3">
            <a href={SCHOOL.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="rounded-full bg-white/10 p-2 hover:bg-gold">
              <SiFacebook size={16} />
            </a>
            <a href="#" aria-label="YouTube" className="rounded-full bg-white/10 p-2 hover:bg-gold">
              <SiYoutube size={16} />
            </a>
          </div>
        </div>

        {/* Col 2 */}
        <div>
          <h3 className="font-heading text-base font-semibold text-white">Quick Links</h3>
          <ul className="mt-4 space-y-2 text-sm">
            {quickLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-gold">{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 3 */}
        <div>
          <h3 className="font-heading text-base font-semibold text-white">Contact</h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex gap-2"><FiMapPin className="mt-0.5 shrink-0 text-gold" /> {SCHOOL.address}</li>
            <li><a href={`tel:${SCHOOL.phone}`} className="flex gap-2 hover:text-gold"><FiPhone className="mt-0.5 shrink-0 text-gold" /> {SCHOOL.phone}</a></li>
            <li><a href={`mailto:${SCHOOL.email}`} className="flex gap-2 hover:text-gold"><FiMail className="mt-0.5 shrink-0 text-gold" /> {SCHOOL.email}</a></li>
            <li><a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">View on Map →</a></li>
          </ul>
        </div>

        {/* Col 4 */}
        <div>
          <h3 className="font-heading text-base font-semibold text-white">School Hours</h3>
          <p className="mt-4 flex items-center gap-2 text-sm">
            <FiClock className="text-gold" /> Sun – Fri: 10:00 AM – 4:00 PM
          </p>
          <p className="text-sm">Saturday: Closed</p>
          <iframe
            src={SCHOOL.mapEmbed}
            title="School location map"
            className="mt-4 h-[150px] w-full rounded-lg border-0"
            loading="lazy"
          />
        </div>
      </div>

      <div className="border-t border-slate-700">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-5 text-xs sm:flex-row">
          <p>© 2026 {SCHOOL.name}. All rights reserved.</p>
          <p>Developed with ❤️ by an alumnus.</p>
        </div>
      </div>
    </footer>
  );
}
