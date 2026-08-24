import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  getSessionUser,
  resetUserPassword,
} from "../../../../server/services/userService";
import { recordAuditEvent } from "../../../../server/services/auditService";

const SESSION_COOKIE = "ceems_session";

async function getCurrentUser() {
  const cookieStore = await cookies();
  const userId = Number(cookieStore.get(SESSION_COOKIE)?.value);
  if (!Number.isInteger(userId)) return null;
  return getSessionUser(userId);
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    }

    if (user.role !== "Super Administrator") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = (await req.json()) as Record<string, unknown>;
    const username = String(body.username ?? body.identifier ?? "").trim();
    const userId = Number(body.userId);
    const identifier =
      username || (Number.isInteger(userId) ? userId : null);

    if (identifier == null || identifier === "") {
      return NextResponse.json(
        { error: "Missing username or userId" },
        { status: 400 },
      );
    }

    const result = await resetUserPassword(identifier, user.username);

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    await recordAuditEvent({
      actorName: user.name,
      actorUsername: user.username,
      actorRole: user.role,
      action: "Reset user password",
      entityType: "user",
      entityId: result.user.id,
      entityLabel: result.user.username,
      beforeValue: "—",
      afterValue: "must_change_password: true",
      metadata: { source: "admin-reset" },
    });

    return NextResponse.json(
      { user: result.user, generatedPassword: result.generatedPassword },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to reset password" },
      { status: 500 },
    );
  }
}
