import Image from "next/image";
import { existsSync } from "fs";
import path from "path";
import { FiMail, FiPhone } from "react-icons/fi";
import { SCHOOL } from "@/lib/school";

/**
 * Notice letterhead — a CSS/SVG recreation of the school's official printed
 * letterpad (red frame, coloured wordmark, green wave, blue footer bar). It
 * wraps the admin-authored notice HTML so every published notice looks like a
 * genuine school circular, on screen and when saved as a PDF.
 *
 * Print: globals.css sizes `.notice-sheet` to a full A4 page (@page size A4),
 * hides the site chrome, and forces colour rendering so the frame/wave/footer
 * survive the browser's default "strip backgrounds" print behaviour.
 *
 * Optional assets (auto-detected, no code change needed):
 *   public/images/logo.png       → the crest in the header (falls back to none)
 *   public/images/signature.png  → principal's signature above the name line
 */
function hasPublicImage(rel: string): boolean {
  return existsSync(path.join(process.cwd(), "public", rel));
}

export default function NoticeLetterhead({
  title,
  dateLabel,
  html,
}: {
  title: string;
  dateLabel: string;
  html: string;
}) {
  const hasLogo = hasPublicImage("images/logo.png");
  const hasSignature = hasPublicImage("images/signature.png");

  return (
    <div className="notice-sheet mx-auto flex min-h-[480px] max-w-[820px] flex-col border-[3px] border-red-600 bg-white p-1 shadow-sm print:shadow-none">
      <div className="flex flex-1 flex-col border-2 border-blue-700">
        {/* ── Letterhead header ───────────────────────────────────────── */}
        <header className="px-5 pt-5 sm:px-7">
          <div className="flex items-start justify-between gap-3">
            {hasLogo && (
              <Image
                src="/images/logo.png"
                alt={`${SCHOOL.name} logo`}
                width={104}
                height={104}
                className="h-24 w-24 shrink-0 object-contain"
              />
            )}
            <div className="text-right leading-tight">
              <h2 className="font-heading text-2xl font-extrabold uppercase tracking-wide text-orange-500 sm:text-3xl">
                Shree Eastern View
              </h2>
              <h2 className="font-heading text-xl font-extrabold uppercase tracking-wide text-red-600 sm:text-2xl">
                English School
              </h2>
              <p className="mt-0.5 text-sm font-bold text-green-700 sm:text-base">
                {SCHOOL.address}
              </p>
              <p className="text-sm font-bold text-red-700">ESTD: {SCHOOL.established} B.S.</p>
            </div>
          </div>

          {/* Green wave with a navy top edge — the letterpad's signature accent */}
          <svg
            viewBox="0 0 1200 130"
            preserveAspectRatio="none"
            aria-hidden="true"
            className="mt-2 block h-14 w-full sm:h-16"
          >
            <path d="M0,55 C300,135 520,5 760,50 C960,85 1090,72 1200,38 L1200,130 L0,130 Z" fill="#1aa64a" />
            <path d="M0,55 C300,135 520,5 760,50 C960,85 1090,72 1200,38" fill="none" stroke="#0F2A44" strokeWidth="6" />
          </svg>

          <p className="mt-1 text-center font-heading text-base font-bold text-red-700 underline underline-offset-2 sm:text-lg">
            COMP.REGD.NO. {SCHOOL.regdNo}
          </p>
        </header>

        {/* ── Body ────────────────────────────────────────────────────── */}
        <div className="flex flex-1 flex-col px-6 pb-2 pt-3 sm:px-10">
          <p className="text-right text-sm text-slate-700">Date: {dateLabel}</p>

          <h1 className="mt-4 text-center font-heading text-2xl font-extrabold uppercase tracking-wide text-red-700 underline decoration-2 underline-offset-4 sm:text-3xl">
            {title}
          </h1>

          <div
            className="prose prose-slate mt-6 max-w-none"
            dangerouslySetInnerHTML={{ __html: html }}
          />

          {/* Signature block */}
          <div className="mt-12 flex justify-end print:mt-16">
            <div className="text-center">
              {hasSignature ? (
                <Image
                  src="/images/signature.png"
                  alt={`${SCHOOL.principalName} signature`}
                  width={160}
                  height={64}
                  className="mx-auto h-16 w-auto object-contain"
                />
              ) : (
                <div className="h-14" />
              )}
              <p className="border-t border-slate-600 px-8 pt-1 font-heading text-base font-bold text-navy">
                {SCHOOL.principalName}
              </p>
              <p className="text-sm font-bold tracking-wide text-slate-700">PRINCIPAL</p>
            </div>
          </div>
        </div>

        {/* ── Footer bar ──────────────────────────────────────────────── */}
        <footer className="mt-auto">
          <div className="h-2.5 bg-yellow-400" />
          <div className="bg-blue-600 px-6 py-3 text-center text-white">
            <p className="flex items-center justify-center gap-2 text-sm font-semibold sm:text-base">
              <FiMail className="shrink-0" /> {SCHOOL.email}
            </p>
            <p className="flex items-center justify-center gap-2 text-sm font-semibold sm:text-base">
              <FiPhone className="shrink-0" /> {SCHOOL.phones.join(", ")}
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
