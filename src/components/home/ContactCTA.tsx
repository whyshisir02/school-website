
import ContactForm from "@/components/contact/ContactForm";

export default function ContactCTA({
  address = "", phone = "",
  email = "", mapEmbed = "",
}: { address?: string; phone?: string; email?: string; mapEmbed?: string } = {}) {
  return <section className="bg-white py-16">
    <div className="container-page grid gap-10 lg:grid-cols-2">
      <div>
        <h2 className="text-3xl font-bold">Get In Touch</h2>
        <p className="mb-6 mt-2 text-slate-600">Have a question about admissions? Send us a message.</p>
        <ContactForm />
      </div>
      <div>
        {mapEmbed && <iframe src={mapEmbed} title="School map" className="h-[400px] w-full rounded-xl border-0 shadow-sm" loading="lazy" />}
        <div className="mt-4 space-y-1 text-sm text-slate-700">
          <p><strong>Address:</strong> {address}</p>
          <p><strong>Phone:</strong> <a href={`tel:${phone}`}>{phone}</a></p>
          <p><strong>Email:</strong> <a href={`mailto:${email}`}>{email}</a></p>
        </div>
      </div>
    </div>
  </section>;
}
