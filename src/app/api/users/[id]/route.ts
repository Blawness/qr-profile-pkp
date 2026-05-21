import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.id, parseInt(id)))
    .limit(1);

  if (!existing) {
    return NextResponse.json({ error: "User tidak ditemukan." }, { status: 404 });
  }

  const adminCount = await db
    .select()
    .from(users)
    .where(eq(users.role, "admin"));

  if (existing.role === "admin" && adminCount.length <= 1) {
    return NextResponse.json(
      { error: "Tidak bisa menghapus admin terakhir." },
      { status: 400 }
    );
  }

  await db.delete(users).where(eq(users.id, parseInt(id)));

  return NextResponse.json({ success: true });
}
