import { getPublishedStaff } from "@/lib/staff-data";
import { STAFF_GROUPS } from "@/lib/staff-types";
import StaffCard from "./StaffCard";

export default async function StaffDirectory() {
  const members = await getPublishedStaff();
  if (!members.length) return null;
  return <section className="container-page py-16" id="faculty">
    <h2 className="text-3xl font-bold">Our Faculty &amp; Staff</h2>
    <p className="mt-2 text-slate-600">Meet the people supporting our school community.</p>
    <div className="mt-10 space-y-10">{Object.entries(STAFF_GROUPS).map(([group, label]) => {
      const people = members.filter((member) => member.group === group);
      return people.length ? <section key={group} aria-label={label}><h3 className="mb-5 text-xl font-semibold">{label}</h3><div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{people.map((member) => <StaffCard key={member.id} member={member} />)}</div></section> : null;
    })}</div>
  </section>;
}
