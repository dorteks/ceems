import { prisma } from "../db/prisma";

export async function createCustomer(data: any) {
  return prisma.customer.create({ data });
}

export async function listCustomers(opts?: { page?: number; size?: number }) {
  const page = opts?.page && opts.page > 0 ? opts.page : 1;
  const size = opts?.size && opts.size > 0 ? opts.size : 50;
  const skip = (page - 1) * size;

  const [items, total] = await Promise.all([
    prisma.customer.findMany({
      skip,
      take: size,
      orderBy: { created_at: "desc" },
    }),
    prisma.customer.count(),
  ]);

  return { items, total, page, size };
}

export async function importCustomers(
  customers: Array<Record<string, unknown>>,
  batchSize = 500,
) {
  let imported = 0;

  for (let i = 0; i < customers.length; i += batchSize) {
    const batch = customers.slice(i, i + batchSize) as any[];

    const result = await prisma.customer.createMany({
      data: batch,
      skipDuplicates: true,
    });

    imported += result.count;
  }

  return { total: customers.length, imported };
}
