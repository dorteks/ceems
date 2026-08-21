import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { authenticateUser, listUsers } from "@/server/services/userService";

const SESSION_COOKIE = "ceems_session";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const body = (await req.json()) as Record<string, unknown>;
    const identifier = String(
      body.identifier ?? body.username ?? body.email ?? "",
    ).trim();
    const password = String(body.password ?? "");

    if (!identifier || !password) {
      return NextResponse.json(
        { error: "Missing username or password" },
        { status: 400 },
      );
    }

    const result = await authenticateUser(identifier, password);

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 401 });
    }

    cookieStore.set(SESSION_COOKIE, String(result.user.id), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    const users =
      result.user.role === "Super Administrator" ? await listUsers() : [];

    return NextResponse.json(
      {
        user: result.user,
        users,
        mustChangePassword: result.mustChangePassword,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json({ error: "Failed to sign in" }, { status: 500 });
  }
}
