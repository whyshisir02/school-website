import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Admin user
  const email = (process.env.ADMIN_EMAIL ?? "admin@easternview.edu.np").toLowerCase();
  const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD ?? "ChangeMe@2026", 12);
  await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, passwordHash, role: "ADMIN" },
  });

  // Sample notices
  const notices = [
    {
      title: "SEE Result Published — Congratulations Class of 2082!",
      category: "EVENT" as const,
      content:
        "<p>We are proud to announce a <strong>100% pass rate</strong> in the SEE examination. Heartiest congratulations to all our students and gratitude to the teachers and parents.</p>",
    },
    {
      title: "Second Terminal Examination Routine Published",
      category: "EXAM" as const,
      content:
        "<p>The routine for the Second Terminal Examination has been published. Exams begin from Poush 15. Students are advised to check the notice board daily.</p>",
    },
    {
      title: "School Closed for Dashain & Tihar Holidays",
      category: "HOLIDAY" as const,
      content:
        "<p>The school will remain closed for the Dashain and Tihar holidays. Classes resume on Kartik 15. Happy Vijaya Dashami!</p>",
    },
    {
      title: "Annual Sports Week — Registration Open",
      category: "EVENT" as const,
      content:
        "<p>Registration for the Annual Sports Week is now open at the front desk. Events include football, volleyball, chess, and athletics.</p>",
    },
    {
      title: "Parent-Teacher Meeting This Saturday",
      category: "GENERAL" as const,
      content:
        "<p>All parents/guardians are invited to the PTM this Saturday, 10 AM – 1 PM, to discuss student progress reports.</p>",
    },
  ];

  for (const n of notices) {
    const slug = n.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
    await prisma.notice.upsert({
      where: { slug },
      update: {},
      create: {
        ...n,
        slug,
        isPublished: true,
        publishedAt: new Date(),
      },
    });
  }

  // Sample albums + placeholder images
  // NOTE: distinct placeholder photos per album so the gallery doesn't look repetitive.
  // Replace with real school photos once available.
  const unsplash = (id: string) => `https://images.unsplash.com/${id}?w=800&q=75&auto=format&fit=crop`;

  const albums = [
    {
      title: "Events",
      slug: "events",
      cover: "photo-1531058020387-3be344556be6", // school event crowd
      photos: [
        "photo-1531058020387-3be344556be6", // event gathering
        "photo-1492684223066-81342ee5ff30", // celebration confetti
        "photo-1523050854058-8df90110c9f1", // graduation caps
        "photo-1546410531-bb4caa6b424d", // teacher in classroom
      ],
    },
    {
      title: "Sports",
      slug: "sports",
      cover: "photo-1461896836934-ffe607ba8211", // sports field
      photos: [
        "photo-1461896836934-ffe607ba8211", // running track
        "photo-1517649763962-0c623066013b", // cycling race
        "photo-1552674605-db6ffd4facb5", // kids playing football
        "photo-1574629810360-7efbbe195018", // football on field
      ],
    },
    {
      title: "Festivals",
      slug: "festivals",
      cover: "photo-1518623489648-a173ef7824f3", // festival lights
      photos: [
        "photo-1518623489648-a173ef7824f3", // festival lights
        "photo-1533227268428-f9ed0900fb3b", // cultural celebration
        "photo-1530103862676-de8c9debad1d", // party celebration
        "photo-1482575832494-771f74bf6857", // colorful festival
      ],
    },
  ];

  // Remove previous seed albums (and their images) so re-seeding refreshes placeholders.
  // Admin-created albums with other slugs are left untouched.
  await prisma.galleryImage.deleteMany({
    where: { album: { slug: { in: albums.map((a) => a.slug) } } },
  });
  await prisma.galleryAlbum.deleteMany({
    where: { slug: { in: albums.map((a) => a.slug) } },
  });

  for (const a of albums) {
    await prisma.galleryAlbum.create({
      data: {
        title: a.title,
        slug: a.slug,
        coverImage: unsplash(a.cover),
        images: {
          create: a.photos.map((id, i) => ({
            url: unsplash(id),
            caption: `${a.title} photo ${i + 1}`,
            order: i,
          })),
        },
      },
    });
  }

  console.log("✅ Seed complete: admin user, 5 notices, 3 albums");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
