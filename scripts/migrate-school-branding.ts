import { PrismaClient } from "@prisma/client";
import { existsSync } from "node:fs";
import { SCHOOL, STATS, HERO_SLIDES, PRINCIPAL, CHAIRMAN } from "../src/lib/school";
import { EMPTY_BRANDING } from "../src/lib/school-branding";

/** One-time migration ONLY for the existing Eastern View database; never a seed for new schools. */
const db = new PrismaClient();
async function main() {
  const row = await db.settings.findUnique({ where: { id: "main" } });
  if (!row || row.schoolName !== SCHOOL.name) throw new Error("This migration only supports the existing Eastern View settings. No changes made.");
  if (row.branding) { console.log("Branding already migrated. No changes made."); return; }
  const branding = { ...EMPTY_BRANDING, shortName: SCHOOL.shortName, location: SCHOOL.location,
    subtitle: `ENGLISH SCHOOL · ${SCHOOL.location.toUpperCase()}`, motto: SCHOOL.motto,
    headline: SCHOOL.tagline, description: `English-medium education from Nursery to Class 10, with learning and care in ${SCHOOL.location}.`,
    established: String(SCHOOL.established), regdNo: SCHOOL.regdNo, facebook: SCHOOL.facebook,
    hours: "Sun – Fri: 10:00 AM – 4:00 PM. Saturday: Closed.",
    aboutIntro: `${row.schoolName} has been serving the Belbari community since ${SCHOOL.established} B.S. From Nursery to Class 10, we combine quality English-medium education with character building and a caring environment so that children from every background can aim high.`,
    vision: "To be a leading school in Morang, producing responsible, confident and skilled citizens of tomorrow.",
    mission: "To provide quality, affordable English-medium education that nurtures academic excellence, character and creativity in every child.",
    logo: existsSync("public/images/logo.png") ? { url: "/images/logo.png", publicId: "" } : null,
    signature: existsSync("public/images/signature.png") ? { url: "/images/signature.png", publicId: "" } : null,
  };
  if (process.argv.includes("--dry-run")) { console.log("Existing school verified. Ready to preserve current branding and default content."); return; }
  await db.settings.update({ where: { id: "main" }, data: { branding,
    stats: row.stats ?? STATS.map((s) => ({ ...s, show: false, verified: false })),
    heroSlides: row.heroSlides ?? HERO_SLIDES,
    principal: row.principal ?? { excerpt: PRINCIPAL.excerpt, messageHtml: PRINCIPAL.messageHtml },
    chairman: row.chairman ?? CHAIRMAN,
  } });
  console.log("Existing school identity preserved in database settings.");
}
main().catch(() => { console.error("Migration stopped. Check the intended database and existing school name; no credentials are printed."); process.exitCode = 1; }).finally(() => db.$disconnect());
