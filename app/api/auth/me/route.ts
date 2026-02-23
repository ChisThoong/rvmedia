import { NextResponse } from "next/server";
import { getAuthUser } from "../../../../lib/auth";

export async function GET() {
  const user = await getAuthUser();

  if (!user) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  return NextResponse.json({ ok: true, user: { username: user.username } });
}
