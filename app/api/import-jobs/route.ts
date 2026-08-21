import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSessionUser } from "@/server/services/userService";
import { listImportJobs } from "@/server/services/importJobService";

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
    const limit = Number(url.searchParams.get("limit") || "10");

    const jobs = await listImportJobs({
      limit: Number.isFinite(limit) && limit > 0 ? limit : 10,
      uploadedById:
        currentUser.role === "Super Administrator" ? null : currentUser.id,
      includeAll: currentUser.role === "Super Administrator",
    });

    return NextResponse.json({ jobs }, { status: 200 });
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch import jobs" },
      { status: 500 },
    );
  }
}
