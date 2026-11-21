import { PrismaClient } from "@/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const { Pool } = pg;

function cleanConnectionString(url: string | undefined): string | undefined {
  if (!url) return undefined;
  try {
    const parsed = new URL(url);
    if (parsed.searchParams.has("channel_binding")) {
      parsed.searchParams.delete("channel_binding");
    }
    if (parsed.searchParams.get("sslmode") === "verify-full") {
      parsed.searchParams.set("sslmode", "require");
    }
    parsed.searchParams.set("uselibpqcompat", "true");
    return parsed.toString();
  } catch {
    return url;
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: pg.Pool | undefined;
};

const connectionString = cleanConnectionString(process.env.DATABASE_URL);

const pool =
  globalForPrisma.pool ??
  new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false,
    },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

globalForPrisma.pool = pool;

const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
  });

globalForPrisma.prisma = prisma;

export default prisma;
