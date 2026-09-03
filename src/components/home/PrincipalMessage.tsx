import Image from "next/image";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import { IMAGES } from "@/lib/school";

export default function PrincipalMessage() {
  return (
    <section className="bg-slate-50">
      <div className="container-page grid items-center gap-10 py-16 md:grid-cols-[auto_1fr]">
        <div className="mx-auto md:mx-0">
          <Image
            src={IMAGES.principal}
            alt="Principal"
            width={200}
            height={200}
            className="h-[200px] w-[200px] rounded-full object-cover shadow-lg ring-4 ring-gold/40"
          />
        </div>
        <div>
          <blockquote className="text-lg italic leading-relaxed text-slate-700 md:text-xl">
            &ldquo;Education is not just about books — it is about building character,
            confidence, and curiosity. At Eastern View, every child is nurtured to
            become their best self.&rdquo;
          </blockquote>
          <p className="mt-4 font-heading font-bold text-navy">Mr. Ram Prasad Sharma</p>
          <p className="text-sm text-slate-500">Principal</p>
          <Link href="/about" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-gold-dark hover:underline">
            Read Full Message <FiArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
