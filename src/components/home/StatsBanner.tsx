import { STATS } from "@/lib/school";

export default function StatsBanner() {
  return (
    <section className="bg-navy py-14">
      <div className="container-page grid grid-cols-2 gap-8 text-center lg:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label}>
            <div className="font-heading text-4xl font-extrabold text-gold">{s.value}</div>
            <div className="mt-1 text-sm text-slate-300">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
