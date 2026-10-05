import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { getVisibleStats, getSiteSettings } from "@/lib/settings";
import { staffInitials } from "@/lib/staff-types";
import { getPrincipalStaff } from "@/lib/staff-data";
import StaffDirectory from "@/components/staff/StaffDirectory";
import {
  FiBookOpen, FiUsers, FiHeart, FiAward,
  FiShield, FiArrowRight, FiTarget, FiCompass,
} from "react-icons/fi";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();
  return { title: "About Us", description: `History, vision and faculty of ${s.name}.` };
}

const values = [
  { icon: FiAward, title: "Academic Excellence", text: "Consistent focus on strong fundamentals and SEE preparation." },
  { icon: FiHeart, title: "Character First", text: "Discipline, respect and honesty are taught alongside every subject." },
  { icon: FiUsers, title: "Care for Every Learner", text: "Our goal is to help every child learn with confidence." },
  { icon: FiShield, title: "Safe Environment", text: "A secure, caring campus where parents can have peace of mind." },
];

// Leave unverified facility claims unpublished.
const facilities: { icon: typeof FiBookOpen; title: string; text: string }[] = []; // Add only school-confirmed facilities.

export default async function AboutPage() {
  const principal = await getPrincipalStaff();
  const principalPhoto = principal?.photoUrl;
  const principalInitials = staffInitials(principal?.name ?? "");
  const stats = await getVisibleStats();
  // Leadership content is shared with the homepage and managed in Settings.
  const {
    name, address, branding, heroSlides,
    principalMessageHtml,
    chairmanName,
    chairmanTitle,
    chairmanMessageHtml,
  } = await getSiteSettings();
  const introImage = heroSlides[0];
  const timeline = branding.established ? [{ year: `${branding.established} B.S.`, text: `School established${branding.location ? ` in ${branding.location}` : ""}.` }] : [];

  return (
    <>
      <PageHeader title="About Our School" breadcrumb="About" />

      {/* Intro */}
      <section className={`container-page grid items-center gap-10 py-16 ${introImage ? "lg:grid-cols-2" : ""}`}>
        <div>
          {(branding.established || branding.regdNo) && <span className="inline-block rounded-full bg-gold/10 px-4 py-1.5 text-sm font-semibold text-gold-dark">
            {[branding.established && `Estd. ${branding.established} B.S.`, branding.regdNo && `Regd. No. ${branding.regdNo}`].filter(Boolean).join(" | ")}
          </span>}
          <h2 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl">
            A school where <span className="text-gold-dark">every child</span> matters
          </h2>
          <p className="mt-5 leading-relaxed text-slate-600">
            {branding.aboutIntro}
          </p>
          {stats.length > 0 && <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {stats.slice(0, 3).map((s) => (
              <div key={s.label} className="rounded-xl bg-slate-50 p-4 text-center">
                <div className="font-heading text-2xl font-bold text-navy">{s.value}</div>
                <div className="mt-1 text-xs text-slate-500">{s.label}</div>
              </div>
            ))}
          </div>}
        </div>
        {introImage && <div className="relative h-[360px] overflow-hidden rounded-2xl shadow-lg">
          <Image
            src={introImage.src}
            alt={introImage.alt}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
            style={introImage.objectPosition ? { objectPosition: introImage.objectPosition } : undefined}
          />
        </div>}
      </section>

      {/* Story timeline */}
      {timeline.length > 0 && <section className="bg-slate-50 py-16">
        <div className="container-page">
          <h2 className="text-3xl font-bold">Our Journey</h2>
          <div className="mt-10 grid max-w-2xl gap-8">
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
      </section>}

      {/* Vision / Mission */}
      {(branding.vision || branding.mission) && <section className="container-page grid gap-6 py-16 md:grid-cols-2">
        {branding.vision && <div className="rounded-xl border-l-4 border-gold bg-white p-8 shadow-sm">
          <h3 className="flex items-center gap-2 text-xl font-bold">
            <FiTarget className="text-gold-dark" /> Our Vision
          </h3>
          <p className="mt-3 leading-relaxed text-slate-600">
            {branding.vision}
          </p>
        </div>}
        {branding.mission && <div className="rounded-xl border-l-4 border-navy bg-white p-8 shadow-sm">
          <h3 className="flex items-center gap-2 text-xl font-bold">
            <FiCompass className="text-navy" /> Our Mission
          </h3>
          <p className="mt-3 leading-relaxed text-slate-600">
            {branding.mission}
          </p>
        </div>}
      </section>}

      {/* Core values */}
      <section className="bg-navy py-16 text-white">
        <div className="container-page">
          <h2 className="text-center text-3xl font-bold text-white">What We Stand For</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v) => (
              <div key={v.title} className="rounded-xl bg-white/5 p-6 text-center ring-1 ring-white/10">
                <v.icon size={28} className="mx-auto text-gold" />
                <h3 className="mt-4 font-heading font-bold text-white">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Facilities appear once the school has confirmed them. */}
      {facilities.length > 0 && <section className="container-page py-16">
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
      </section>}

      {/* Principal's message — the full letter. The home page shows a short
          excerpt and its "Read Full Message" link scrolls straight here.
          The letter body is admin-editable at /admin/settings. */}
      {principal && principalMessageHtml && <section id="principal-message" className="scroll-mt-28 bg-white py-16">
        <div className="container-page max-w-4xl">
          <h2 className="text-3xl font-bold">Message from the Principal</h2>
          <div className="mt-8 flex flex-col items-center gap-8 sm:flex-row sm:items-start sm:gap-10">
            <div className="shrink-0 text-center">
              {principalPhoto ? (
                <Image
                  src={principalPhoto}
                  alt={`${principal.name}, Principal of ${name}`}
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
              <p className="mt-4 font-heading font-bold text-navy">{principal.name}</p>
              <p className="text-sm text-slate-500">{principal.position}, {name}</p>
            </div>
            <div
              className="prose prose-slate max-w-none leading-relaxed text-slate-600"
              dangerouslySetInnerHTML={{ __html: principalMessageHtml }}
            />
          </div>
        </div>
      </section>}

      {/* Chairman message — name/title/body admin-editable at /admin/settings. */}
      {chairmanMessageHtml && <section className="bg-slate-50 py-16">
        <div className="container-page max-w-3xl text-center">
          <h2 className="text-3xl font-bold">Message from the Chairman</h2>
          <div
            className="prose prose-slate mt-6 max-w-none border-l-4 border-gold pl-6 text-left italic leading-relaxed text-slate-700"
            dangerouslySetInnerHTML={{ __html: chairmanMessageHtml }}
          />
          <p className="mt-4 text-left font-heading font-bold text-navy">{chairmanName || "School Management Committee"}</p>
          <p className="text-left text-sm text-slate-500">{chairmanTitle}</p>
        </div>
      </section>}

      <StaffDirectory />

      {/* CTA */}
      <section className="container-page pb-16">
        <div className="flex flex-col items-center justify-between gap-6 rounded-2xl bg-navy p-10 text-white sm:flex-row">
          <div>
            <h2 className="text-2xl font-bold text-white">Want to learn more?</h2>
            <p className="mt-1 text-slate-300">Visit our campus at {address} or send us a message.</p>
          </div>
          <Link href="/contact" className="btn-primary shrink-0">
            Contact Us <FiArrowRight />
          </Link>
        </div>
      </section>
    </>
  );
}
