import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSessionUser } from "@/server/services/userService";
import { listAuditEvents } from "@/server/services/auditService";

const SESSION_COOKIE = "ceems_session";

async function getCurrentUser() {
  const cookieStore = await cookies();
  const userId = Number(cookieStore.get(SESSION_COOKIE)?.value);

  if (!Number.isInteger(userId)) {
    return null;
  }

  return getSessionUser(userId);
}

export async function GET(req: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    }

    const url = new URL(req.url);
    const search = url.searchParams.get("q") || undefined;
    const limit = Number(url.searchParams.get("limit") || "100");

    const events = await listAuditEvents({
      search,
      limit: Number.isFinite(limit) && limit > 0 ? limit : 100,
    });

    return NextResponse.json({ events }, { status: 200 });
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to load audit trail" },
      { status: 500 },
    );
  }
}
