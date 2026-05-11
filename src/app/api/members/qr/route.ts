import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { members } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateQRCode } from "@/lib/qr";

const UPLOADTHING_API_KEY = process.env.UPLOADTHING_SECRET!;
const UPLOADTHING_APP_ID = process.env.UPLOADTHING_APP_ID!;

async function uploadToUploadThing(
  buffer: Buffer,
  filename: string,
  contentType: string
): Promise<string> {
  const keyParts = UPLOADTHING_APP_ID ? [UPLOADTHING_APP_ID, filename] : [filename];
  const key = keyParts.join("/");

  // Get presigned URL from UploadThing
  const prepareRes = await fetch("https://uploadthing.com/api/prepareUpload", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-uploadthing-api-key": UPLOADTHING_API_KEY,
      "x-uploadthing-version": "7.7.4",
      "x-uploadthing-be-adapter": "server-sdk",
    },
    body: JSON.stringify({
      files: [
        {
          name: filename,
          size: buffer.length,
          type: contentType,
          customId: null,
          key,
        },
      ],
    }),
  });

  if (!prepareRes.ok) {
    const text = await prepareRes.text();
    throw new Error(`Prepare upload failed: ${prepareRes.status} ${text}`);
  }

  const presigned = await prepareRes.json();
  const presignedUrl = presigned[0]?.presignedUrl || presigned[0]?.url;
  const fileKey = presigned[0]?.key || key;
  const fileUrl = presigned[0]?.url || presigned[0]?.ufsUrl;

  if (!presignedUrl) {
    throw new Error("No presigned URL in response");
  }

  // Upload file to presigned URL
  const uploadRes = await fetch(presignedUrl, {
    method: "PUT",
    headers: {
      "Content-Type": contentType,
      "Content-Length": String(buffer.length),
    },
    body: buffer,
  });

  if (!uploadRes.ok) {
    const text = await uploadRes.text();
    throw new Error(`Upload failed: ${uploadRes.status} ${text}`);
  }

  return fileUrl || `https://${UPLOADTHING_APP_ID}.ufs.sh/f/${fileKey}`;
}

export async function POST(request: NextRequest) {
  let memberId: number;
  try {
    const body = await request.json();
    memberId = body.memberId;
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

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
    const qrCodeUrl = await uploadToUploadThing(
      qrBuffer,
      `qr-${member.userId || member.id}.png`,
      "image/png"
    );

    await db
      .update(members)
      .set({ qrCodeUrl, updatedAt: new Date() })
      .where(eq(members.id, memberId));

    return NextResponse.json({ qrCodeUrl });
  } catch (err) {
    console.error("QR generation error:", err);
    const error = err as Error;
    return NextResponse.json(
      { error: error.message || "QR generation failed" },
      { status: 500 }
    );
  }
}
