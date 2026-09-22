import Image from "next/image";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import { SCHOOL } from "@/lib/school";
import { staffPhoto, staffInitials } from "@/lib/staff";

export default function PrincipalMessage() {
  // Photo auto-detected from /public/images/staff/jb-magar.jpg — drop the real
  // photo in and it replaces the initials avatar with no code change.
  const photo = staffPhoto("jb-magar");
  const initials = staffInitials(SCHOOL.principalName);

  return (
    <section className="bg-white">
      <div className="container-page py-12 md:py-14">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-8 text-center sm:flex-row sm:items-start sm:text-left md:gap-10">
          <div className="shrink-0">
            {photo ? (
              <Image
                src={photo}
                alt={`${SCHOOL.principalName}, Principal of ${SCHOOL.shortName}`}
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
              &ldquo;Education is not just about books — it is about building character,
              confidence, and curiosity. At Eastern View, every child is nurtured to
              become their best self.&rdquo;
            </blockquote>
            <p className="mt-4 font-heading font-bold text-navy">{SCHOOL.principalName}</p>
            <p className="text-sm text-slate-500">Principal, {SCHOOL.shortName}</p>
            <Link href="/about" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-gold-dark hover:underline">
              Read Full Message <FiArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
