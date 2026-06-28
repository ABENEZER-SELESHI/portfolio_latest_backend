/**
 * Reset or create the admin user from ADMIN_EMAIL / ADMIN_PASSWORD in .env
 * Run: npx tsx scripts/reset-admin.ts
 */
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@portfolio.local";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "ChangeMe123!";
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash },
    create: { email: adminEmail, passwordHash, role: "ADMIN" },
  });

  if (adminEmail !== "admin@portfolio.local") {
    const removed = await prisma.user.deleteMany({
      where: { email: "admin@portfolio.local" },
    });
    if (removed.count) {
      console.log("Removed default admin@portfolio.local");
    }
  }

  console.log("Admin ready:", adminEmail);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
