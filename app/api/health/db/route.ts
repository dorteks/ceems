import { NextResponse } from "next/server";
import { prisma } from "@/server/db/prisma";

export async function GET() {
  const startedAt = Date.now();

  try {
    const [users, customers] = await Promise.all([
      prisma.user.count(),
      prisma.customer.count(),
    ]);

    return NextResponse.json(
      {
        ok: true,
        database: "connected",
        users,
        customers,
        durationMs: Date.now() - startedAt,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("Prisma client init failed:", error);
    console.error("Database health check failed:", error);

    return NextResponse.json(
      {
        ok: false,
        database: "unavailable",
        error: "Unable to reach the database.",
        durationMs: Date.now() - startedAt,
      },
      { status: 503 },
    );
  }
}
