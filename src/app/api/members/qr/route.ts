import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { members } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateQRCode } from "@/lib/qr";
import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

export async function POST(request: NextRequest) {
  const { memberId } = await request.json();

  if (!memberId) {
    return NextResponse.json(
      { error: "memberId is required" },
      { status: 400 }
    );
  }

  const [member] = await db
    .select()
    .from(members)
    .where(eq(members.id, memberId))
    .limit(1);

  if (!member) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  try {
    const qrBuffer = await generateQRCode(member.userId, member.name);
    const blob = new Blob([new Uint8Array(qrBuffer)], { type: "image/png" });
    const file = new File([blob], `qr-${member.userId || member.id}.png`, {
      type: "image/png",
    });
    const uploadResult = await utapi.uploadFiles(file);

    if (uploadResult.error) {
      return NextResponse.json(
        { error: "Failed to upload QR" },
        { status: 500 }
      );
    }

    const qrCodeUrl = uploadResult.data.url;

    await db
      .update(members)
      .set({ qrCodeUrl, updatedAt: new Date() })
      .where(eq(members.id, memberId));

    return NextResponse.json({ qrCodeUrl });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json(
      { error: error.message || "QR generation failed" },
      { status: 500 }
    );
  }
}
