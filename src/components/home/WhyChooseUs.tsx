import Link from "next/link";
import { FiBookOpen, FiUsers, FiAward, FiHome } from "react-icons/fi";

const cards = [
  {
    icon: <FiBookOpen size={28} />,
    title: "Nursery & KG",
    desc: "Play-based early learning that builds a joyful foundation.",
    href: "/academics#nursery",
  },
  {
    icon: <FiUsers size={28} />,
    title: "Primary (1–5)",
    desc: "Strong basics in English, Math, Nepali and beyond.",
    href: "/academics#primary",
  },
  {
    icon: <FiAward size={28} />,
    title: "Secondary (6–10)",
    desc: "SEE-focused teaching with consistent outstanding results.",
    href: "/academics#secondary",
  },
  {
    icon: <FiHome size={28} />,
    title: "Facilities",
    desc: "Library, science lab, computer lab, sports & transport.",
    href: "/academics#facilities",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="bg-slate-50 py-16">
      <div className="container-page">
        <h2 className="text-center text-3xl font-bold">Why Choose Us?</h2>
        <p className="mt-2 text-center text-slate-600">A complete learning journey for every child.</p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c) => (
            <Link
              key={c.title}
              href={c.href}
              className="group rounded-xl border border-slate-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-navy text-gold">{c.icon}</div>
              <h3 className="mt-4 text-lg font-semibold">{c.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{c.desc}</p>
              <span className="mt-3 inline-block text-sm font-semibold text-gold-dark group-hover:underline">
                Learn More →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
