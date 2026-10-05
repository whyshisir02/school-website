import Image from "next/image";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";

import { getSiteSettings } from "@/lib/settings";
import { staffInitials } from "@/lib/staff-types";
import { getPrincipalStaff } from "@/lib/staff-data";

export default async function PrincipalMessage() {
  const [principal, { principalExcerpt, name }] = await Promise.all([getPrincipalStaff(), getSiteSettings()]);
  if (!principal) return null;
  const photo = principal.photoUrl;
  const initials = staffInitials(principal.name);

  return (
    <section className="bg-white">
      <div className="container-page py-12 md:py-14">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-8 text-center sm:flex-row sm:items-start sm:text-left md:gap-10">
          <div className="shrink-0">
            {photo ? (
              <Image
                src={photo}
                alt={`${principal.name}, Principal of ${name}`}
                width={160}
                height={160}
                className="h-[160px] w-[160px] rounded-full object-cover shadow-lg ring-4 ring-gold/40"
              />
            ) : (
              <div
                aria-hidden="true"
                className="flex h-[160px] w-[160px] items-center justify-center rounded-full bg-navy font-heading text-4xl font-bold text-gold shadow-lg ring-4 ring-gold/40"
              >
                {initials}
              </div>
            )}
          </div>
          <div>
            <blockquote className="text-lg italic leading-relaxed text-slate-700 md:text-xl">
              &ldquo;{principalExcerpt}&rdquo;
            </blockquote>
            <p className="mt-4 font-heading font-bold text-navy">{principal.name}</p>
            <p className="text-sm text-slate-500">{principal.position}, {name}</p>
            <Link href="/about#principal-message" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-gold-dark hover:underline">
              Read Full Message <FiArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
