import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof makePrisma>;
};

function makePrisma() {
  const url = process.env.DATABASE_URL ?? "";
  const isAccelerate = url.startsWith("prisma://") || url.startsWith("prisma+postgres://");

  const client = new PrismaClient();
  // Accelerate / Prisma Postgres (prisma+postgres://) URLs need the Accelerate
  // extension; a direct postgres:// connection uses the bundled binary engine.
  return isAccelerate ? client.$extends(withAccelerate()) : client;
}

export const prisma = globalForPrisma.prisma ?? makePrisma();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
