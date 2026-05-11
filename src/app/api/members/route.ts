import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { members } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (userId) {
    const result = await db
      .select()
      .from(members)
      .where(eq(members.userId, userId))
      .limit(1);

    if (result.length === 0) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    return NextResponse.json({ member: result[0] });
  }

  const allMembers = await db.select().from(members).orderBy(members.createdAt);
  return NextResponse.json({ members: allMembers });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { userId, name, email, photoUrl, qrCodeUrl } = body;

  if (!name) {
    return NextResponse.json(
      { error: "name is required" },
      { status: 400 }
    );
  }

  if (userId) {
    const existing = await db
      .select()
      .from(members)
      .where(eq(members.userId, userId))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Member with this userId already exists" },
        { status: 409 }
      );
    }
  }

  const [member] = await db
    .insert(members)
    .values({
      userId: userId || null,
      name,
      email: email || null,
      photoUrl: photoUrl || null,
      qrCodeUrl: qrCodeUrl || null,
    })
    .returning();

  return NextResponse.json({ member }, { status: 201 });
}
