import Image from "next/image";
import { schoolInitials } from "@/lib/school-branding";
export default function SchoolLogo({ name, url, size = 48 }: { name: string; url?: string | null; size?: number }) {
  return url ? <Image src={url} alt={`${name} logo`} width={size} height={size} className="shrink-0 rounded-full bg-white object-contain" style={{ width: size, height: size }} /> :
    <span aria-label={name} className="inline-flex shrink-0 items-center justify-center rounded-full bg-navy font-bold text-gold ring-1 ring-gold/40" style={{ width: size, height: size }}>{schoolInitials(name)}</span>;
}
