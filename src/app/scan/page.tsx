import { ScanView } from "@/components/scan-view";

export default async function ScanPage({
  searchParams,
}: {
  searchParams: Promise<{ userId?: string; name?: string }>;
}) {
  const { userId, name } = await searchParams;

  if (!userId || !name) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Invalid QR Code</h1>
          <p className="text-gray-600 mt-2">Missing userId or name parameter.</p>
        </div>
      </div>
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  let member: { photoUrl?: string | null; name: string } | null = null;
  let fetchError: string | null = null;

  try {
    const res = await fetch(
      `${baseUrl}/api/members?userId=${encodeURIComponent(userId)}`,
      { cache: "no-store" }
    );

    if (res.ok) {
      const data = await res.json();
      member = data.member;
    } else if (res.status === 404) {
      fetchError = "Member tidak ditemukan.";
    } else {
      fetchError = "Gagal mengambil data member.";
    }
  } catch {
    fetchError = "Gagal terhubung ke server.";
  }

  return (
    <ScanView
      userId={userId}
      name={decodeURIComponent(name)}
      photoUrl={member?.photoUrl || null}
      dbName={member?.name || null}
      fetchError={fetchError}
    />
  );
}
