import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const HERO_INTRO =
  "I build modern, scalable web applications with a focus on clean architecture, performance, and exceptional user experience across the full stack.";

const ABOUT_BIO = `Hello! I'm Abenezer Seleshi, a passionate Full-Stack Web Developer with expertise in building modern and scalable websites. With a strong foundation in both front-end and back-end technologies, I enjoy creating seamless user experiences and robust server-side solutions. My goal is to leverage my skills to develop innovative applications that solve real-world problems and enhance user engagement.`;

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@portfolio.local";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "ChangeMe123!";
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash,
      role: "ADMIN",
    },
  });

  const existingSite = await prisma.siteSettings.findFirst();
  if (!existingSite) {
    await prisma.siteSettings.create({
      data: {
        heroName: "Abenezer Seleshi",
        heroTitle: "Full-Stack Web Developer",
        heroIntro: HERO_INTRO,
        aboutBio: ABOUT_BIO,
      },
    });
  }

  const categories = [
    { name: "Frontend", skills: ["HTML", "CSS", "JavaScript", "TypeScript", "React", "Next.js"] },
    { name: "Backend", skills: ["Node.js", "Express.js", "NestJS"] },
    { name: "Databases", skills: ["PostgreSQL", "MySQL", "MongoDB"] },
    { name: "DevOps & Cloud", skills: ["Docker", "AWS", "CI/CD"] },
    { name: "Tools", skills: ["Git", "GitHub", "Linux"] },
  ];

  for (let i = 0; i < categories.length; i++) {
    const cat = categories[i];
    let category = await prisma.skillCategory.findFirst({ where: { name: cat.name } });
    if (!category) {
      category = await prisma.skillCategory.create({ data: { name: cat.name, sortOrder: i } });
    }

    for (let j = 0; j < cat.skills.length; j++) {
      const skillName = cat.skills[j];
      const exists = await prisma.skill.findFirst({
        where: { categoryId: category.id, name: skillName },
      });
      if (!exists) {
        await prisma.skill.create({
          data: { categoryId: category.id, name: skillName, sortOrder: j },
        });
      }
    }
  }

  const techItems = [
    "React",
    "Next.js",
    "TypeScript",
    "Node.js",
    "PostgreSQL",
    "Docker",
    "AWS",
  ];
  for (let i = 0; i < techItems.length; i++) {
    const name = techItems[i];
    const exists = await prisma.techStackItem.findFirst({ where: { name } });
    if (!exists) {
      await prisma.techStackItem.create({
        data: { name, sortOrder: i, proficiency: 80 + (i % 3) * 5 },
      });
    }
  }

  console.log("Seed completed. Admin:", adminEmail);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
