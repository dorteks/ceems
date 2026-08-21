import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { changePassword } from "@/server/services/userService";

const SESSION_COOKIE = "ceems_session";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const userId = Number(cookieStore.get(SESSION_COOKIE)?.value);
    if (!Number.isInteger(userId)) {
      return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    }

    const body = (await req.json()) as Record<string, unknown>;
    const currentPassword = String(body.currentPassword ?? "");
    const nextPassword = String(body.nextPassword ?? "");

    if (!currentPassword || !nextPassword) {
      return NextResponse.json(
        { error: "Missing password fields" },
        { status: 400 },
      );
    }

    const result = await changePassword(userId, currentPassword, nextPassword);

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ user: result.user }, { status: 200 });
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update password" },
      { status: 500 },
    );
  }
}
