#!/usr/bin/env node
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { randomBytes, scryptSync } = require("crypto");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaClient } = require("@prisma/client");
// eslint-disable-next-line @typescript-eslint/no-require-imports
require("dotenv").config();

const prisma = new PrismaClient();

function generatePasswordHash(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

async function main() {
  const username = "ayodele.superadmin";
  const defaultPassword = "Ceems@2026";

  const existing = await prisma.user.findFirst({ where: { username } });
  if (existing) {
    console.log("User already exists with id:", existing.id);
    await prisma.$disconnect();
    return;
  }

  const created = await prisma.user.create({
    data: {
      name: "Ayodele Superadmin",
      username,
      email: null,
      phone: null,
      role: "SUPER_ADMINISTRATOR",
      hub: "ALL",
      status: "ACTIVE",
      password_hash: generatePasswordHash(defaultPassword),
      must_change_password: true,
      created_by: null,
      updated_by: null,
    },
  });

  console.log("Created user id:", created.id);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
