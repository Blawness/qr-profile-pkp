import { DashboardClient } from "./dashboard-client";
import type { Member } from "@/lib/types";

export default async function DashboardPage() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  let members: Member[] = [];
  let fetchError: string | null = null;

  try {
    const res = await fetch(`${baseUrl}/api/members`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      members = data.members || [];
    } else {
      fetchError = "Gagal mengambil data member.";
    }
  } catch {
    fetchError = "Gagal terhubung ke server.";
  }

  return <DashboardClient initialMembers={members} fetchError={fetchError} />;
}
