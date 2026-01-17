import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@devbook.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "admin123";
  const adminName = process.env.SEED_ADMIN_NAME ?? "Admin";

  const hash = await bcrypt.hash(adminPassword, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: adminName,
      password: hash,
      role: "ADMIN",
    },
    create: {
      id: crypto.randomUUID(),
      name: adminName,
      email: adminEmail,
      password: hash,
      role: "ADMIN",
    },
  });

  console.log("✅ Usuário ADMIN criado/atualizado:", adminEmail);
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
