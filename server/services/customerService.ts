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
      orderBy: { createdAt: "desc" },
    }),
    prisma.customer.count(),
  ]);

  return { items, total, page, size };
}
