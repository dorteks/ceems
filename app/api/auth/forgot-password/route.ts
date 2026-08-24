import { NextResponse } from "next/server";
import { getUserByLogin, resetUserPassword } from "@/server/services/userService";
import { recordAuditEvent } from "@/server/services/auditService";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const identifier = String(body.identifier ?? body.username ?? body.email ?? "").trim();

    if (!identifier) {
      return NextResponse.json(
        { error: "Missing username or email" },
        { status: 400 },
      );
    }

    const user = await getUserByLogin(identifier);

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const result = await resetUserPassword(user.id, null);

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    await recordAuditEvent({
      actorName: "Self-service recovery",
      actorUsername: user.username,
      actorRole: user.role,
      action: "Requested password reset",
      entityType: "user",
      entityId: user.id,
      entityLabel: user.username,
      beforeValue: "—",
      afterValue: "must_change_password: true",
      metadata: { source: "auth/forgot-password" },
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
