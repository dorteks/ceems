import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSessionUser, listUsers } from "@/server/services/userService";

const SESSION_COOKIE = "ceems_session";

export async function GET() {
  const cookieStore = await cookies();
  const userId = Number(cookieStore.get(SESSION_COOKIE)?.value);

  if (!Number.isInteger(userId)) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const user = await getSessionUser(userId);

  if (!user) {
    cookieStore.delete(SESSION_COOKIE);
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const users = user.role === "Super Administrator" ? await listUsers() : [];

  return NextResponse.json({ user, users }, { status: 200 });
}
