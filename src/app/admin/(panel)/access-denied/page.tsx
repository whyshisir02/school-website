import Link from "next/link";
import { requirePageAccess } from "@/lib/auth-helpers";
export default async function AccessDeniedPage() {
  await requirePageAccess();
  return <div className="max-w-xl rounded-2xl border border-slate-200 bg-white p-6"><h1 className="text-2xl font-bold">Access restricted</h1><p className="my-4 text-slate-600">Your account does not have access to this section. Contact the website owner if you need additional access.</p><Link className="btn-primary" href="/admin/dashboard">Return to overview</Link></div>;
}
