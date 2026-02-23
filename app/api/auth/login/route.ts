import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import clientPromise from "../../../../lib/mongodb";
import { signToken } from "../../../../lib/auth";

type LoginPayload = {
  username?: string;
  password?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LoginPayload;
    const username = body.username?.trim();
    const password = body.password || "";

    if (!username || !password) {
      return NextResponse.json(
        { ok: false, error: "Missing credentials" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || "rvmedia");
    const admin =
      (await db.collection("admin").findOne({ username })) ||
      (await db.collection("admin").findOne({ email: username }));

    if (!admin) {
      return NextResponse.json(
        { ok: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const storedHash = admin.passwordHash as string | undefined;
    const storedPassword = admin.password as string | undefined;

    let valid = false;
    if (storedHash) {
      valid = await bcrypt.compare(password, storedHash);
    } else if (storedPassword) {
      if (storedPassword.startsWith("$2")) {
        valid = await bcrypt.compare(password, storedPassword);
      } else {
        valid = storedPassword === password;
      }
    }

    if (!valid) {
      return NextResponse.json(
        { ok: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const token = signToken({
      sub: admin._id.toString(),
      username: admin.username || username
    });
    const cookieStore = await cookies();

    cookieStore.set("admin_token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/"
    });

    return NextResponse.json({
      ok: true,
      user: { username: admin.username || username }
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: "Login failed" },
      { status: 500 }
    );
  }
}
