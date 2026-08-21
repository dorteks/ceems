import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSessionUser } from "@/server/services/userService";
import { getImportJobErrorReport } from "@/server/services/importJobService";

const SESSION_COOKIE = "ceems_session";

async function getCurrentUser() {
  const cookieStore = await cookies();
  const userId = Number(cookieStore.get(SESSION_COOKIE)?.value);

  if (!Number.isInteger(userId)) {
    return null;
  }

  return getSessionUser(userId);
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    }

    const { id: idParam } = await ctx.params;
    const id = Number(idParam);

    if (!Number.isInteger(id)) {
      return NextResponse.json({ error: "Invalid job id" }, { status: 400 });
    }

    const report = await getImportJobErrorReport(id);

    if (!report) {
      return NextResponse.json({ error: "Import job not found" }, { status: 404 });
    }

    if (
      report.job.uploadedBy?.id !== currentUser.id &&
      currentUser.role !== "Super Administrator"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const fileName = report.job.fileName.replace(/\.[^.]+$/, "") || "import";
    const headers = new Headers({
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${fileName}-error-report.csv"`,
    });

    return new NextResponse(report.csv, { status: 200, headers });
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to build error report" },
      { status: 500 },
    );
  }
}
