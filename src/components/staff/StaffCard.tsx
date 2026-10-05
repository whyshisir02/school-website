import Image from "next/image";
import { staffInitials } from "@/lib/staff-types";

export default function StaffCard({ member }: { member: { name: string; position: string; subject: string; qualifications: string; bio: string; photoUrl: string | null } }) {
  return <article className="min-w-0 rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
    {member.photoUrl ? <Image src={member.photoUrl} alt={member.name} width={120} height={120} sizes="120px" className="mx-auto h-[120px] w-[120px] rounded-full object-cover ring-4 ring-gold/20" /> :
      <div aria-hidden="true" className="mx-auto flex h-[120px] w-[120px] items-center justify-center rounded-full bg-navy text-3xl font-bold text-gold ring-4 ring-gold/20">{staffInitials(member.name) || "?"}</div>}
    <h3 className="mt-5 break-words text-lg font-semibold">{member.name || "Staff name"}</h3>
    <p className="mt-1 break-words text-sm font-medium text-slate-700">{member.position || "Position"}</p>
    {member.subject && <p className="mt-1 break-words text-sm text-slate-500">{member.subject}</p>}
    {member.qualifications && <p className="mt-3 break-words text-xs text-slate-500">{member.qualifications}</p>}
    {member.bio && <details className="mt-4 text-left"><summary className="cursor-pointer rounded-lg py-2 text-center text-sm font-semibold text-gold-dark">View profile</summary><p className="mt-2 whitespace-pre-line break-words text-sm leading-relaxed text-slate-600">{member.bio}</p></details>}
  </article>;
}
