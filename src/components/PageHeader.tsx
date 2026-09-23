import Link from "next/link";

export default function PageHeader({
  title,
  breadcrumb,
}: {
  title: string;
  breadcrumb: string;
}) {
  return (
    <section className="bg-navy py-12 text-white">
      <div className="container-page">
        <h1 className="font-heading text-3xl font-bold">{title}</h1>
        <p className="mt-2 text-sm text-slate-300">
          <Link href="/" className="hover:text-gold">Home</Link> <span className="mx-1">/</span> {breadcrumb}
        </p>
      </div>
    </section>
  );
}
