import { NextResponse } from "next/server";
import { db } from "@/db";
import { members } from "@/db/schema";
import { isNotNull, eq } from "drizzle-orm";
import { generateQRCode } from "@/lib/qr";
import { UTApi, UTFile } from "uploadthing/server";

const utapi = new UTApi();

export async function POST() {
  try {
    const allMembers = await db
      .select()
      .from(members)
      .where(isNotNull(members.userId));

    if (allMembers.length === 0) {
      return NextResponse.json(
        { message: "Tidak ada member dengan User ID." },
        { status: 200 }
      );
    }

    let successCount = 0;
    let failCount = 0;

    for (const member of allMembers) {
      try {
        const qrBuffer = await generateQRCode(member.userId, member.name);
        const file = new UTFile(
          [new Uint8Array(qrBuffer)],
          `qr-${member.userId || member.id}.png`,
          { type: "image/png" }
        );
        const uploadResult = await utapi.uploadFiles(file);

        if (uploadResult.error) {
          console.error(`QR upload failed for member ${member.id}:`, uploadResult.error);
          failCount++;
          continue;
        }

        await db
          .update(members)
          .set({ qrCodeUrl: uploadResult.data.url, updatedAt: new Date() })
          .where(eq(members.id, member.id));

        successCount++;
      } catch (err) {
        console.error(`QR regenerate failed for member ${member.id}:`, err);
        failCount++;
      }
    }

    return NextResponse.json({
      message: `${successCount} QR berhasil diregenerate${failCount > 0 ? `, ${failCount} gagal` : ""}.`,
      count: successCount,
    });
  } catch (err) {
    console.error("Regenerate all QR error:", err);
    return NextResponse.json(
      { error: "Gagal regenerate QR." },
      { status: 500 }
    );
  }
}
