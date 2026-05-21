import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "@/lib/auth";

export async function GET() {
  const allUsers = await db
    .select({
      id: users.id,
      username: users.username,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(users.createdAt);

  return NextResponse.json({ users: allUsers });
}

export async function POST(request: NextRequest) {
  const { username, password, role } = await request.json();

  if (!username || !password) {
    return NextResponse.json(
      { error: "Username dan password diperlukan." },
      { status: 400 }
    );
  }

  if (password.length < 4) {
    return NextResponse.json(
      { error: "Password minimal 4 karakter." },
      { status: 400 }
    );
  }

  const existing = await db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  if (existing.length > 0) {
    return NextResponse.json(
      { error: "Username sudah digunakan." },
      { status: 409 }
    );
  }

  const [user] = await db
    .insert(users)
    .values({
      username,
      passwordHash: hashPassword(password),
      role: role === "admin" ? "admin" : "operator",
    })
    .returning({
      id: users.id,
      username: users.username,
      role: users.role,
      createdAt: users.createdAt,
    });

  return NextResponse.json({ user }, { status: 201 });
}
