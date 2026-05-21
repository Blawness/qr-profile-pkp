import { ScanView } from "@/components/scan-view";
import { db } from "@/db";
import { members } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function ScanPage({
  searchParams,
}: {
  searchParams: Promise<{ userId?: string; name?: string }>;
}) {
  const { userId, name } = await searchParams;

  const decodedName = name ? decodeURIComponent(name) : undefined;

  if (!decodedName) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Invalid QR Code</h1>
          <p className="text-gray-600 mt-2">Missing name parameter.</p>
        </div>
      </div>
    );
  }

  let member: typeof members.$inferSelect | null = null;
  let fetchError: string | null = null;

  if (userId) {
    try {
      const result = await db
        .select()
        .from(members)
        .where(eq(members.userId, userId))
        .limit(1);

      if (result.length > 0) {
        member = result[0];
      } else {
        fetchError = "Member tidak ditemukan.";
      }
    } catch {
      fetchError = "Gagal mengambil data member.";
    }
  }

  return (
    <ScanView
      userId={userId || null}
      memberId={member?.id ?? null}
      name={decodedName}
      photoUrl={member?.photoUrl || null}
      email={member?.email || null}
      divisi={member?.divisi || null}
      jabatan={member?.jabatan || null}
      noTelp={member?.noTelp || null}
      dbName={member?.name || null}
      fetchError={fetchError}
    />
  );
}
