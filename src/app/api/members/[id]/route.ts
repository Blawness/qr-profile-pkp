import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { members } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { name, email, photoUrl, qrCodeUrl } = body;

  const [member] = await db
    .update(members)
    .set({
      ...(name !== undefined && { name }),
      ...(email !== undefined && { email }),
      ...(photoUrl !== undefined && { photoUrl }),
      ...(qrCodeUrl !== undefined && { qrCodeUrl }),
      updatedAt: new Date(),
    })
    .where(eq(members.id, parseInt(id)))
    .returning();

  if (!member) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  return NextResponse.json({ member });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const [member] = await db
    .delete(members)
    .where(eq(members.id, parseInt(id)))
    .returning();

  if (!member) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
