import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { SCHOOL } from "@/lib/school";
import { getVisibleStats, getSiteSettings } from "@/lib/settings";
import { STAFF, staffPhoto, staffInitials } from "@/lib/staff";
import {
  FiBookOpen, FiMonitor, FiUsers, FiHeart, FiAward, FiMapPin,
  FiTruck, FiShield, FiGrid, FiArrowRight, FiTarget, FiCompass,
} from "react-icons/fi";
import { TbFlask } from "react-icons/tb";

export const metadata: Metadata = {
  title: "About Us",
  description: `History, vision, mission, facilities and faculty of ${SCHOOL.name}, Morang.`,
};

// ⚠️ PLACEHOLDER TIMELINE — confirm actual history with the school
const timeline = [
  { year: "2065 B.S.", text: "School established in Belbari-10, Bhaunne, serving the local community." },
  { year: "2070 B.S.", text: "Upgraded to lower secondary; new academic block built." },
  { year: "2075 B.S.", text: "First SEE batch appeared for the board examination." },
  { year: "2082 B.S.", text: "Growing into a full English-medium school with modern facilities and school transport." },
];

const values = [
  { icon: FiAward, title: "Academic Excellence", text: "Consistent focus on strong fundamentals and SEE preparation." },
  { icon: FiHeart, title: "Character First", text: "Discipline, respect and honesty are taught alongside every subject." },
  { icon: FiUsers, title: "Small Classes", text: "Individual attention so no child is left behind." },
  { icon: FiShield, title: "Safe Environment", text: "A secure, caring campus where parents can have peace of mind." },
];

// ⚠️ PLACEHOLDER FACILITIES — confirm actual facilities with the school
const facilities = [
  { icon: FiBookOpen, title: "Library", text: "Age-appropriate books, reference materials and a quiet reading space." },
  { icon: FiMonitor, title: "Computer Lab", text: "Hands-on ICT classes with modern computers and internet access." },
  { icon: TbFlask, title: "Science Lab", text: "Practical demonstrations and experiments for secondary-level science." },
  { icon: FiGrid, title: "Sports & Playground", text: "Football, volleyball, chess and annual sports week on a open ground." },
  { icon: FiTruck, title: "School Transport", text: "Safe bus/van service on major routes of Belbari and surrounding areas with trained drivers." },
  { icon: FiMapPin, title: "Accessible Location", text: "Located along the Postal Highway at Belbari-10, Bhaunne — easy to reach from nearby villages." },
];

export default async function AboutPage() {
  // Same auto-detected photo as the home page: drop the real photo in at
  // /public/images/staff/jb-magar.jpg and it replaces the initials avatar.
  const principalPhoto = staffPhoto("jb-magar");
  const principalInitials = staffInitials(SCHOOL.principalName);
  const stats = await getVisibleStats();
  // Leadership messages — admin-editable at /admin/settings; fall back to the
  // PRINCIPAL/CHAIRMAN defaults in school.ts.
  const {
    heroSlides,
    principalMessageHtml,
    chairmanName,
    chairmanTitle,
    chairmanMessageHtml,
  } = await getSiteSettings();
  const introImage = heroSlides[0];

  return (
    <>
      <PageHeader title="About Our School" breadcrumb="About" />

      {/* Intro */}
      <section className="container-page grid items-center gap-10 py-16 lg:grid-cols-2">
        <div>
          <span className="inline-block rounded-full bg-gold/10 px-4 py-1.5 text-sm font-semibold text-gold-dark">
            Estd. {SCHOOL.established} B.S. · Comp. Regd. No. {SCHOOL.regdNo}
          </span>
          <h2 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl">
            A community school where <span className="text-gold">every child</span> matters
          </h2>
          <p className="mt-5 leading-relaxed text-slate-600">
            {SCHOOL.name} has been serving the Belbari community since {SCHOOL.established} B.S.
            From Nursery to Class 10, we combine quality English-medium education with
            character building, modern facilities and a caring environment — so that
            children from every background can aim high.
          </p>
          <div className="mt-7 grid grid-cols-3 gap-4">
            {stats.slice(0, 3).map((s) => (
              <div key={s.label} className="rounded-xl bg-slate-50 p-4 text-center">
                <div className="font-heading text-2xl font-bold text-navy">{s.value}</div>
                <div className="mt-1 text-xs text-slate-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative h-[360px] overflow-hidden rounded-2xl shadow-lg">
          <Image
            src={introImage.src}
            alt={introImage.alt}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
            style={introImage.objectPosition ? { objectPosition: introImage.objectPosition } : undefined}
          />
        </div>
      </section>

      {/* Story timeline */}
      <section className="bg-slate-50 py-16">
        <div className="container-page">
          <h2 className="text-3xl font-bold">Our Journey</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-4">
            {timeline.map((t, i) => (
              <div key={t.year} className="relative rounded-xl bg-white p-6 shadow-sm">
                <span className="absolute -top-3 left-6 flex h-7 w-7 items-center justify-center rounded-full bg-navy font-heading text-xs font-bold text-gold">
                  {i + 1}
                </span>
                <div className="font-heading font-bold text-navy">{t.year}</div>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{t.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision / Mission */}
      <section className="container-page grid gap-6 py-16 md:grid-cols-2">
        <div className="rounded-xl border-l-4 border-gold bg-white p-8 shadow-sm">
          <h3 className="flex items-center gap-2 text-xl font-bold">
            <FiTarget className="text-gold-dark" /> Our Vision
          </h3>
          <p className="mt-3 leading-relaxed text-slate-600">
            To be the leading community school in Morang, producing responsible,
            confident and skilled citizens of tomorrow.
          </p>
        </div>
        <div className="rounded-xl border-l-4 border-navy bg-white p-8 shadow-sm">
          <h3 className="flex items-center gap-2 text-xl font-bold">
            <FiCompass className="text-navy" /> Our Mission
          </h3>
          <p className="mt-3 leading-relaxed text-slate-600">
            To provide quality, affordable English-medium education that nurtures
            academic excellence, character and creativity in every child.
          </p>
        </div>
      </section>

      {/* Core values */}
      <section className="bg-navy py-16 text-white">
        <div className="container-page">
          <h2 className="text-center text-3xl font-bold">What We Stand For</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v) => (
              <div key={v.title} className="rounded-xl bg-white/5 p-6 text-center ring-1 ring-white/10">
                <v.icon size={28} className="mx-auto text-gold" />
                <h3 className="mt-4 font-heading font-bold">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Facilities incl. transport */}
      <section className="container-page py-16">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Facilities</h2>
          <p className="mt-2 text-slate-600">Everything your child needs to learn, play and grow safely.</p>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {facilities.map((f) => (
            <div key={f.title} className="group rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-1 hover:shadow-md">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gold/10 text-gold-dark transition group-hover:bg-navy group-hover:text-gold">
                <f.icon size={20} />
              </div>
              <h3 className="mt-4 font-heading font-bold text-navy">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Principal's message — the full letter. The home page shows a short
          excerpt and its "Read Full Message" link scrolls straight here.
          The letter body is admin-editable at /admin/settings. */}
      <section id="principal-message" className="scroll-mt-28 bg-white py-16">
        <div className="container-page max-w-4xl">
          <h2 className="text-3xl font-bold">Message from the Principal</h2>
          <div className="mt-8 flex flex-col items-center gap-8 sm:flex-row sm:items-start sm:gap-10">
            <div className="shrink-0 text-center">
              {principalPhoto ? (
                <Image
                  src={principalPhoto}
                  alt={`${SCHOOL.principalName}, Principal of ${SCHOOL.shortName}`}
                  width={160}
                  height={160}
                  className="mx-auto h-[160px] w-[160px] rounded-full object-cover shadow-lg ring-4 ring-gold/40"
                />
              ) : (
                <div
                  aria-hidden="true"
                  className="mx-auto flex h-[160px] w-[160px] items-center justify-center rounded-full bg-navy font-heading text-4xl font-bold text-gold shadow-lg ring-4 ring-gold/40"
                >
                  {principalInitials}
                </div>
              )}
              <p className="mt-4 font-heading font-bold text-navy">{SCHOOL.principalName}</p>
              <p className="text-sm text-slate-500">Principal, {SCHOOL.shortName}</p>
            </div>
            <div
              className="prose prose-slate max-w-none leading-relaxed text-slate-600"
              dangerouslySetInnerHTML={{ __html: principalMessageHtml }}
            />
          </div>
        </div>
      </section>

      {/* Chairman message — name/title/body admin-editable at /admin/settings. */}
      <section className="bg-slate-50 py-16">
        <div className="container-page max-w-3xl text-center">
          <h2 className="text-3xl font-bold">Message from the Chairman</h2>
          <div
            className="prose prose-slate mt-6 max-w-none border-l-4 border-gold pl-6 text-left italic leading-relaxed text-slate-700"
            dangerouslySetInnerHTML={{ __html: chairmanMessageHtml }}
          />
          <p className="mt-4 text-left font-heading font-bold text-navy">{chairmanName || "School Management Committee"}</p>
          <p className="text-left text-sm text-slate-500">{chairmanTitle}</p>
        </div>
      </section>

      {/* Faculty & staff — renders from src/lib/staff.ts; photos auto-detected from /public/images/staff/ */}
      <section className="container-page py-16">
        <h2 className="text-3xl font-bold">Our Faculty &amp; Staff</h2>
        <p className="mt-2 text-slate-600">Dedicated teachers guiding every classroom.</p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STAFF.map((member) => {
            const photo = staffPhoto(member.slug);
            return (
              <div key={member.slug} className="rounded-xl bg-white p-6 text-center shadow-sm ring-1 ring-slate-100 transition hover:shadow-md">
                {photo ? (
                  <Image
                    src={photo}
                    alt={member.name}
                    width={120}
                    height={120}
                    loading="lazy"
                    className="mx-auto h-[120px] w-[120px] rounded-full object-cover ring-4 ring-gold/20"
                  />
                ) : (
                  <div
                    aria-hidden="true"
                    className="mx-auto flex h-[120px] w-[120px] items-center justify-center rounded-full bg-navy font-heading text-2xl font-bold text-gold ring-4 ring-gold/20"
                  >
                    {staffInitials(member.name, member.slug)}
                  </div>
                )}
                <h3 className="mt-4 font-semibold">{member.name}</h3>
                <p className="text-sm text-slate-500">
                  {member.role}
                  {member.subject ? ` · ${member.subject}` : ""}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="container-page pb-16">
        <div className="flex flex-col items-center justify-between gap-6 rounded-2xl bg-navy p-10 text-white sm:flex-row">
          <div>
            <h2 className="text-2xl font-bold">Want to learn more?</h2>
            <p className="mt-1 text-slate-300">Visit our campus at {SCHOOL.address} or send us a message.</p>
          </div>
          <Link href="/contact" className="btn-primary shrink-0">
            Contact Us <FiArrowRight />
          </Link>
        </div>
      </section>
    </>
  );
}
